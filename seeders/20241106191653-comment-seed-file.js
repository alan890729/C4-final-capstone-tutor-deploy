'use strict'
const { faker } = require('@faker-js/faker')
const { Reservation, Teacher } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let expiredReservations = await Reservation.findAll({
      attributes: ['id', 'teacherId', 'studentId'],
      where: { isExpired: true }
    })
    let teachersId = await Teacher.findAll({ attributes: ['id'] })
    expiredReservations = expiredReservations.map(r => r.toJSON()) // [{ id, teacherId, studentId }, {},...]
    teachersId = teachersId.map(t => t.id) // [tid, tid, tid,...]

    const comments = []
    teachersId.forEach(tid => {
      const teacherExpiredReservations = expiredReservations.filter(r => r.teacherId === tid)
      for (let i = 0; i < 2; i++) {
        const selectedReservation = teacherExpiredReservations.splice(Math.floor(Math.random() * teacherExpiredReservations.length), 1)[0]
        comments.push({
          text: faker.lorem.sentence({ min: 3, max: 10 }),
          rate: Math.floor(Math.random() * 5) + 1,
          student_id: selectedReservation.studentId,
          teacher_id: selectedReservation.teacherId,
          reservation_id: selectedReservation.id,
          created_at: new Date(),
          updated_at: new Date()
        })
      }
    })

    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.bulkInsert('Comments', comments)
      await transaction.commit()
    } catch (err) {
      console.error(err)
      await transaction.rollback()
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Comments', null)
  }
}
