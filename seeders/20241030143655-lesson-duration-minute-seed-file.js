'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('LessonDurationMinutes', [
      {
        duration_minute: 30,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        duration_minute: 60,
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('LessonDurationMinutes', null)
  }
}
