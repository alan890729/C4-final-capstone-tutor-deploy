'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('DaysPerWeek', [
      { name: 'Sun.', day: 0, created_at: new Date(), updated_at: new Date() },
      { name: 'Mon.', day: 1, created_at: new Date(), updated_at: new Date() },
      { name: 'Tue.', day: 2, created_at: new Date(), updated_at: new Date() },
      { name: 'Wed.', day: 3, created_at: new Date(), updated_at: new Date() },
      { name: 'Thur.', day: 4, created_at: new Date(), updated_at: new Date() },
      { name: 'Fri.', day: 5, created_at: new Date(), updated_at: new Date() },
      { name: 'Sat.', day: 6, created_at: new Date(), updated_at: new Date() }
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('DaysPerWeek', null)
  }
}
