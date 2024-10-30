'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn('Teachers', 'lesson_duration_minute_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'LessonDurationMinutes',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      }, { transaction })

      await queryInterface.removeColumn('Teachers', 'lesson_duration_minute', { transaction })

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      console.error(err)
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn('Teacher', 'lesson_duration_minute', {
        type: Sequelize.INTEGER,
        allowNull: false
      })

      await queryInterface.removeColumn('Teachers', 'lesson_duration_minute_id')

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      console.error(err)
    }
  }
}
