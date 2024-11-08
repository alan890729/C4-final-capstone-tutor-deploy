'use strict'
const dayjs = require('dayjs')
const { LessonDurationMinute, Teacher, Student, AvailableDay } = require('../models')

function formatTimezoneToStandard (dayjsDatetimeObj) {
  return new Date(dayjsDatetimeObj)
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const totalMinutes = 180 // currently available from 18:00 to 21:00, 180 minutes
    let teachers = await Teacher.findAll({
      attributes: ['id'],
      include: [
        {
          model: LessonDurationMinute,
          attributes: ['durationMinute']
        },
        {
          model: AvailableDay,
          attributes: ['day']
        }
      ]
    })
    let students = await Student.findAll({ attributes: ['id'] })
    teachers = teachers.map(teacher => teacher.toJSON())
    students = students.map(student => student.id)

    // expired reservations
    const theFarestDayInThePast = -14 // for randomize perpose, i limit the day of the farest expired records is two weeks ago
    const expiredReservations = []
    const teachersPastAvailableReservations = []

    teachers.forEach(teacher => {
      const perLessonDuration = teacher.LessonDurationMinute.durationMinute
      const amountOfClasses = totalMinutes / perLessonDuration

      for (let i = theFarestDayInThePast; i < 0; i++) {
        const startingPointOfEveryDayClass = dayjs().add(i, 'day').hour(18).minute(0).second(0).millisecond(0)
        for (let j = 0; j < amountOfClasses; j++) {
          teachersPastAvailableReservations.push({
            teacher_id: teacher.id,
            start_from: formatTimezoneToStandard(startingPointOfEveryDayClass.add(j * perLessonDuration, 'minute')),
            end_at: formatTimezoneToStandard(startingPointOfEveryDayClass.add((j + 1) * perLessonDuration, 'minute')),
            duration_hours: perLessonDuration / 60
          })
        }
      }
    })

    teachers.forEach((teacher, i) => {
      const teacherPastAvailableReservations = teachersPastAvailableReservations.filter(r => r.teacher_id === teacher.id)
      for (let j = 0; j < 4; j++) {
        const reservation = teacherPastAvailableReservations.splice(Math.floor(Math.random() * teacherPastAvailableReservations.length), 1)[0]
        expiredReservations.push({
          ...reservation,
          is_expired: true,
          student_id: students[i],
          created_at: new Date(),
          updated_at: new Date()
        })
      }
    })

    // future reservations
    const theFarestDayInTheFuture = 13 // 0~13 two weeks, but i don't want to deal with 0, will start from 1
    const futureReservations = []
    const teachersFutureAvailableReservations = []

    teachers.forEach(teacher => {
      const perLessonDuration = teacher.LessonDurationMinute.durationMinute
      const teacherAvailableDays = teacher.AvailableDays.map(day => day.day)
      const amountOfClasses = totalMinutes / perLessonDuration

      for (let i = 1; i < theFarestDayInTheFuture; i++) {
        const startingPointOfEveryDayClass = dayjs().add(i, 'day').hour(18).minute(0).second(0).millisecond(0)
        if (teacherAvailableDays.includes(startingPointOfEveryDayClass.day())) {
          for (let j = 0; j < amountOfClasses; j++) {
            teachersFutureAvailableReservations.push({
              teacher_id: teacher.id,
              start_from: formatTimezoneToStandard(startingPointOfEveryDayClass.add(j * perLessonDuration, 'minute')),
              end_at: formatTimezoneToStandard(startingPointOfEveryDayClass.add((j + 1) * perLessonDuration, 'minute')),
              duration_hours: perLessonDuration / 60
            })
          }
        }
      }
    })

    teachers.forEach((teacher, i) => {
      const teacherFutureAvailableReservations = teachersFutureAvailableReservations.filter(r => r.teacher_id === teacher.id)
      for (let j = 0; j < 2; j++) {
        const reservation = teacherFutureAvailableReservations.splice(Math.floor(Math.random() * teacherFutureAvailableReservations.length), 1)[0]
        futureReservations.push({
          ...reservation,
          is_expired: false,
          student_id: students[i],
          created_at: new Date(),
          updated_at: new Date()
        })
      }
    })

    const reservations = expiredReservations.concat(futureReservations)

    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.bulkInsert('Reservations', reservations)
      await transaction.commit()
    } catch (err) {
      console.error(err)
      await transaction.rollback()
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Reservations', null)
  }
}
