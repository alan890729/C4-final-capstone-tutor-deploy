'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'student'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'status')
  }
}
