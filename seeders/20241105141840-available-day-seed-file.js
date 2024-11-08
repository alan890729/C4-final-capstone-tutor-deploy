'use strict'
const { Teacher, DaysPerWeek } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let weekDays = await DaysPerWeek.findAll({ attributes: ['day'] })
    weekDays = weekDays.map(d => d.day)
    const teacherIds = await Teacher.findAll({ attributes: ['id'] })

    const availableDays = []
    teacherIds.forEach(t => {
      let cache = []

      while (cache.length < 2) {
        cache = []
        weekDays.forEach(day => {
          if (Math.floor(Math.random() * 2)) {
            cache.push({
              day,
              created_at: new Date(),
              updated_at: new Date(),
              teacher_id: t.id
            })
          }
        })
      }

      cache.forEach(c => {
        availableDays.push(c)
      })
    })

    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.bulkInsert('AvailableDays', availableDays)
      await transaction.commit()
    } catch (err) {
      console.error(err)
      await transaction.rollback()
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('AvailableDays', null)
  }
}
