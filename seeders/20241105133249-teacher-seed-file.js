'use strict'
const { faker } = require('@faker-js/faker')
const { User, LessonDurationMinute } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const userIdsWithTeacherStatus = await User.findAll({
      attributes: ['id'],
      where: { status: 'teacher' }
    })
    const lessonDurationMinuteIds = await LessonDurationMinute.findAll({ attributes: ['id'] })

    const teachers = userIdsWithTeacherStatus.map(u => ({
      teaching_style: faker.lorem.paragraph(),
      class_intro: faker.lorem.paragraph(),
      class_link: 'https://example.com',
      user_id: u.id,
      lesson_duration_minute_id: lessonDurationMinuteIds[Math.floor(Math.random() * lessonDurationMinuteIds.length)].id,
      created_at: new Date(),
      updated_at: new Date()
    }))

    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.bulkInsert('Teachers', teachers)
      await transaction.commit()
    } catch (err) {
      console.error(err)
      await transaction.rollback()
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Teachers', null)
  }
}
