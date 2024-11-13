const dayjs = require('dayjs')
const { LessonDurationMinute, User, Student, Teacher, AvailableDay, DaysPerWeek, Reservation, Comment, sequelize } = require('../models')
const { teacherHasReservedLesson, studentHasReservedLesson, lessonCheck } = require('../helpers/reservation-time-helpers')
const { preciseDividedBy } = require('../helpers/math-helpers')

const studentControllers = {
  getBecomeTeacherPage (req, res, next) {
    return Promise.all([
      LessonDurationMinute.findAll({
        attributes: ['id', 'durationMinute'],
        raw: true
      }),
      DaysPerWeek.findAll({
        attributes: ['name', 'day'],
        raw: true
      })
    ])
      .then(([lessonDurationMinutes, daysPerWeek]) => {
        return res.render('student/become-teacher', { lessonDurationMinutes, daysPerWeek })
      })
      .catch(err => next(err))
  },

  async postTeacher (req, res, next) {
    try {
      const userId = Number(req.params.userId)
      const teachingStyle = req.body.teachingStyle?.trim()
      const classIntro = req.body.classIntro?.trim()
      const classLink = req.body.classLink?.trim()
      const lessonDurationMinuteId = Number(req.body.lessonDurationMinuteId)
      let availableDays = req.body.availableDays

      if (userId !== req.user.id) throw new Error('access denied!')
      if (!availableDays) throw new Error('You must pick at least one available day!')

      if (typeof availableDays === 'string') {
        availableDays = Number(availableDays)
        if (availableDays < 0 || availableDays > 6 || !Number.isInteger(availableDays)) throw new Error('Invalid Input on availableDays!')
      } else if (Array.isArray(availableDays)) {
        availableDays = availableDays.map(day => {
          day = Number(day)
          if (day < 0 || day > 6 || !Number.isInteger(day)) throw new Error('Invalid Input on availableDays!')

          return day
        })
      } else {
        throw new Error('Invalid Input on availableDays!')
      }

      if (!userId || userId < 1 || !Number.isInteger(userId)) throw new Error('User didn\'t exist!')
      if (!lessonDurationMinuteId || lessonDurationMinuteId < 1 || !Number.isInteger(lessonDurationMinuteId)) throw new Error('Invalid Input on lessonDurationMinuteId')

      const transaction = await sequelize.transaction()
      try {
        await Student.destroy({ where: { userId }, transaction })
        await User.update({ status: 'teacher' }, { where: { id: userId }, transaction })
        const teacher = await Teacher.create({
          teachingStyle,
          classIntro,
          classLink,
          userId,
          lessonDurationMinuteId
        }, { transaction })

        if (typeof availableDays === 'number') await AvailableDay.create({ day: availableDays, teacherId: teacher.id }, { transaction })
        if (Array.isArray(availableDays)) {
          await Promise.all(availableDays.map(async day => {
            await AvailableDay.create({ day, teacherId: teacher.id }, { transaction })
          }))
        }

        await transaction.commit()
      } catch (err) {
        await transaction.rollback()
        throw err
      }

      req.flash('success_messages', '您已成為老師!')
      return res.redirect(`/user/profile/${userId}`)
    } catch (err) {
      return next(err)
    }
  },

  async postReservation (req, res, next) {
    try {
      const teacherId = Number(req.params.teacherId)
      const studentId = req.user.Student.id
      let { reservationDateTimeSection } = req.body
      if (!reservationDateTimeSection) throw new Error('You must select at least one lesson!')
      if (typeof reservationDateTimeSection === 'string') {
        reservationDateTimeSection = [reservationDateTimeSection]
      }

      const teacherReservations = await Reservation.findAll({
        attributes: ['startFrom', 'endAt', 'teacherId'],
        where: {
          teacherId,
          isExpired: false
        }
      })
      const studentReservations = await Reservation.findAll({
        attributes: ['startFrom', 'endAt', 'teacherId'],
        where: {
          studentId,
          isExpired: false
        }
      })
      const selectedLessons = reservationDateTimeSection.map(timeSection => {
        const [startFrom, endAt] = timeSection.split(' - ')
        return {
          startFrom,
          endAt
        }
      })

      if (!await lessonCheck(selectedLessons, teacherId)) throw new Error('invalid class!')

      if (teacherHasReservedLesson(selectedLessons, teacherReservations) || studentHasReservedLesson(selectedLessons, studentReservations)) throw new Error('Some of the selected lessons have already been reserved, please select the lessons we provide, those are the lessons haven\'t reserved!!!!')

      const transaction = await sequelize.transaction()
      try {
        await Promise.all(selectedLessons.map(async lesson => {
          return Reservation.create({
            startFrom: new Date(lesson.startFrom),
            endAt: new Date(lesson.endAt),
            durationHours: preciseDividedBy(dayjs(lesson.endAt).diff(dayjs(lesson.startFrom), 'minute'), 60, 1),
            isExpired: false,
            studentId,
            teacherId
          }, { transaction })
        }))
        await transaction.commit()
      } catch (err) {
        await transaction.rollback()
        throw err
      }

      req.flash('success_messages', '預約成功!')
      return res.redirect(`/user/profile/${req.user.id}`)
    } catch (err) {
      return next(err)
    }
  },

  async getCommentPage (req, res, next) {
    try {
      const reservationId = Number(req.params.reservationId)
      const [reservation, hasCommented] = await Promise.all([
        Reservation.findByPk(reservationId, {
          attributes: ['studentId', 'teacherId', 'startFrom', 'endAt'],
          include: [
            { model: Teacher, include: [{ model: User, attributes: ['name'] }] }
          ]
        }),
        Comment.findOne({
          where: { reservationId }
        })
      ])
      if (!reservation) throw new Error('Reservation not found!')
      const studentId = req.user.Student?.id
      if (!studentId) throw new Error('Only student can comment on reservations!') // 理論上這個可以不用，會被isStudent middleware擋下來
      if (studentId !== reservation.studentId) throw new Error('access denied!')
      if (hasCommented) throw new Error('You\'ve already commented this reservation before!')

      return res.render('student/comment', {
        reservationId,
        teacherName: reservation.Teacher.User.name,
        startFrom: reservation.startFrom,
        endAt: reservation.endAt
      })
    } catch (err) {
      return next(err)
    }
  },

  async postComment (req, res, next) {
    try {
      const reservationId = Number(req.params.reservationId)
      const studentId = req.user.Student?.id
      const reservation = await Reservation.findByPk(reservationId, {
        attributes: ['studentId', 'teacherId']
      })
      if (!reservation) throw new Error('Reservation not found!')
      if (studentId !== reservation.studentId) throw new Error('access denied!')
      const teacherId = reservation.teacherId
      const rate = Number(req.body.rate)
      const text = req.body.text?.trim()
      if (!rate || rate < 1 || rate > 5 || !Number.isInteger(rate)) throw new Error('invalid input on rate, rate should be a positive integer between (and include) 1 and 5!')
      if (!text) throw new Error('Comment is required!')

      const transaction = await sequelize.transaction()
      try {
        await Comment.create({
          text,
          rate,
          studentId,
          teacherId,
          reservationId
        })
        await transaction.commit()
      } catch (err) {
        await transaction.rollback()
        throw err
      }
      req.flash('success_messages', '評論成功!')
      return res.redirect(`/user/profile/${req.user.id}`)
    } catch (err) {
      return next(err)
    }
  }
}

module.exports = studentControllers
