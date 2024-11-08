'use strict'
const { User } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const userIdsWithStudentStatus = await User.findAll({
      attributes: ['id'],
      where: { status: 'student' }
    })
    const students = userIdsWithStudentStatus.map(u => ({
      created_at: new Date(),
      updated_at: new Date(),
      user_id: u.id
    }))

    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.bulkInsert('Students', students)
      await transaction.commit()
    } catch (err) {
      console.error(err)
      await transaction.rollback()
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Students', null)
  }
}
