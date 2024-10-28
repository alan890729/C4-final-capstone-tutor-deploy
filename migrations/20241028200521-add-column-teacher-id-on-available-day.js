'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('AvailableDays', 'teacher_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Teachers',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('AvailableDays', 'teacher_id')
  }
}
