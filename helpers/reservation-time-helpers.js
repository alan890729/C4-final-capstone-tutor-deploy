const dayjs = require('dayjs')
const isBetween = require('dayjs/plugin/isBetween')
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const { AvailableDay, Teacher, LessonDurationMinute } = require('../models')

const reservationTimeHelpers = {
  teacherAvailableDaysInTwoWeeks (teacherAvailableDays, perLessonDuration, teacherReservedLessons, studentReservedLessons) {
    const theFarestDayInTheFuture = 14
    const totalMinutes = 180
    const amountOfLessons = totalMinutes / perLessonDuration

    const teacherAvailableDaysInTwoWeeks = []
    for (let i = 0; i < theFarestDayInTheFuture; i++) {
      const startingPointOfFirstLesson = dayjs().add(i, 'day').hour(18).minute(0).second(0).millisecond(0)
      if (teacherAvailableDays.includes(startingPointOfFirstLesson.day())) {
        const lessons = []
        for (let j = 0; j < amountOfLessons; j++) {
          const startFrom = startingPointOfFirstLesson.add(j * perLessonDuration, 'minute')
          const endAt = startFrom.add(perLessonDuration, 'minute')
          if (i === 0 && startFrom.diff() <= 0) {
            // 當天，當前時間已過可選時間
            lessons.push({
              id: j + 1,
              startFrom,
              endAt,
              isOccupied: true
            })
            continue
          }

          const isOccupied = teacherReservedLessons.some(reservedLesson => {
            const endAtInReservedLesson = endAt.isBetween(dayjs(reservedLesson.startFrom), dayjs(reservedLesson.endAt), null, '(]')
            const startFromInReservedLesson = startFrom.isBetween(dayjs(reservedLesson.startFrom), dayjs(reservedLesson.endAt), null, '[)')
            const incomingLessonEnvelopesReservedLesson = startFrom.isSameOrBefore(dayjs(reservedLesson.startFrom)) && endAt.isSameOrAfter(dayjs(reservedLesson.endAt))

            return endAtInReservedLesson || startFromInReservedLesson || incomingLessonEnvelopesReservedLesson
          }) || studentReservedLessons.some(reservedLesson => {
            const endAtInReservedLesson = endAt.isBetween(dayjs(reservedLesson.startFrom), dayjs(reservedLesson.endAt), null, '(]')
            const startFromInReservedLesson = startFrom.isBetween(dayjs(reservedLesson.startFrom), dayjs(reservedLesson.endAt), null, '[)')
            const incomingLessonEnvelopesReservedLesson = startFrom.isSameOrBefore(dayjs(reservedLesson.startFrom)) && endAt.isSameOrAfter(dayjs(reservedLesson.endAt))

            return endAtInReservedLesson || startFromInReservedLesson || incomingLessonEnvelopesReservedLesson
          })

          lessons.push({
            id: j + 1,
            startFrom,
            endAt,
            isOccupied
          })
        }

        teacherAvailableDaysInTwoWeeks.push({
          day: startingPointOfFirstLesson,
          lessons
        })
      }
    }

    return teacherAvailableDaysInTwoWeeks
  },

  teacherHasReservedLesson (selectedLessons, teacherReservations) {
    return selectedLessons.some(lesson => {
      return teacherReservations.some(r => {
        const lessonStartFromInTeacherReservations = dayjs(lesson.startFrom).isBetween(dayjs(r.startFrom), dayjs(r.endAt), null, '[)')
        const lessonEndAtInTeacherReservations = dayjs(lesson.endAt).isBetween(dayjs(r.startFrom), dayjs(r.endAt), null, '(]')
        const lessonEnvolopesTeacherReservations = dayjs(lesson.startFrom).isSameOrBefore(dayjs(r.startFrom)) && dayjs(lesson.endAt).isSameOrAfter(dayjs(r.endAt))

        return lessonStartFromInTeacherReservations || lessonEndAtInTeacherReservations || lessonEnvolopesTeacherReservations
      })
    })
  },

  studentHasReservedLesson (selectedLessons, studentReservations) {
    return selectedLessons.some(lesson => {
      return studentReservations.some(r => {
        const lessonStartFromInStudentReservations = dayjs(lesson.startFrom).isBetween(dayjs(r.startFrom), dayjs(r.endAt), null, '[)')
        const lessonEndAtInStudentReservations = dayjs(lesson.endAt).isBetween(dayjs(r.startFrom), dayjs(r.endAt), null, '(]')
        const lessonEnvolopesStudentReservations = dayjs(lesson.startFrom).isSameOrBefore(dayjs(r.startFrom)) && dayjs(lesson.endAt).isSameOrAfter(dayjs(r.endAt))

        return lessonStartFromInStudentReservations || lessonEndAtInStudentReservations || lessonEnvolopesStudentReservations
      })
    })
  },

  async lessonCheck (selectedLessons, teacherId) {
    let teacherAvailableDays = await AvailableDay.findAll({
      attributes: ['day'],
      where: { teacherId }
    })
    let perLessonDuration = await Teacher.findByPk(teacherId, {
      attributes: ['lessonDurationMinuteId'],
      include: [
        { model: LessonDurationMinute, attributes: ['durationMinute'] }
      ]
    })
    teacherAvailableDays = teacherAvailableDays.map(d => d.day)
    perLessonDuration = perLessonDuration.LessonDurationMinute.durationMinute
    return selectedLessons.every(l => {
      const currentDate = dayjs().hour(0).minute(0).second(0).millisecond(0)
      const farestDate = currentDate.add(13, 'day').hour(0).minute(0).second(0).millisecond(0)
      const lStartFromDate = dayjs(l.startFrom).hour(0).minute(0).second(0).millisecond(0)
      const lEndAtDate = dayjs(l.endAt).hour(0).minute(0).second(0).millisecond(0)
      const selectLessonBeforeCurrentDate = lStartFromDate.diff(currentDate, 'day') < 0 || lEndAtDate.diff(currentDate, 'day') < 0
      const selectLessonAfterFarestDate = lStartFromDate.diff(farestDate, 'day') > 0 || lEndAtDate.diff(farestDate, 'day') > 0
      if (selectLessonBeforeCurrentDate || selectLessonAfterFarestDate) return false

      const day = dayjs(l.startFrom).day()
      if (!teacherAvailableDays.includes(day)) return false

      const totalMinutes = 180
      const amountOfLessons = Math.floor(totalMinutes / perLessonDuration)
      return Array.from({ length: amountOfLessons }).some((lesson, i) => {
        const startPoint = dayjs().hour(18).minute(0).second(0).millisecond(0)
        const startTime = startPoint.add(i * perLessonDuration, 'minute').format('HH:mm:ss')
        const endTime = startPoint.add((i + 1) * perLessonDuration, 'minute').format('HH:mm:ss')
        return dayjs(l.startFrom).format('HH:mm:ss') === startTime && dayjs(l.endAt).format('HH:mm:ss') === endTime
      })
    })
  }
}

module.exports = reservationTimeHelpers
