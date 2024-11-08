'use strict'
const bcrypt = require('bcryptjs')
const { faker } = require('@faker-js/faker')
const ct = require('countries-and-timezones')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const allCountryCodes = Object.keys(ct.getAllCountries())
    const amountOfDummyUsers = 19
    const password = '12345678' // for demo, when register your own account, use your password instead.
    const emailProvider = 'example.com'
    const dummyStatus = [
      {
        name: 'student',
        amount: 9
      },
      {
        name: 'teacher',
        amount: 10
      }
    ]
    const usernames = []
    for (let i = 0; i < amountOfDummyUsers; i++) {
      let username = faker.person.firstName()
      while (usernames.includes(username)) {
        username = faker.person.firstName()
      }
      usernames.push(username)
    }

    const users = []
    users.push({
      name: 'root',
      email: `root@${emailProvider}`,
      password: await bcrypt.hash(password, 10),
      status: 'admin',
      avatar: null,
      self_intro: null,
      country_code: null,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'user1',
      email: `user1@${emailProvider}`,
      password: await bcrypt.hash(password, 10),
      status: 'student',
      avatar: faker.image.avatar(),
      self_intro: faker.person.bio(),
      country_code: allCountryCodes[Math.floor(Math.random() * allCountryCodes.length)],
      created_at: new Date(),
      updated_at: new Date()
    })

    const dummyUsers = await Promise.all(Array.from({ length: amountOfDummyUsers }).map(async (_, i) => {
      let dummyStatusIndex = Math.floor(Math.random() * dummyStatus.length)
      let selectedStatus = dummyStatus[dummyStatusIndex]
      while (selectedStatus.amount === 0) {
        dummyStatus.splice(dummyStatusIndex, 1)
        dummyStatusIndex = Math.floor(Math.random() * dummyStatus.length)
        selectedStatus = dummyStatus[dummyStatusIndex]
      }

      selectedStatus.amount--

      return {
        name: `${usernames[i]}`,
        email: `${usernames[i]}@${emailProvider}`,
        password: await bcrypt.hash(password, 10),
        status: selectedStatus.name,
        avatar: faker.image.avatar(),
        self_intro: faker.person.bio(),
        country_code: allCountryCodes[Math.floor(Math.random() * allCountryCodes.length)],
        created_at: new Date(),
        updated_at: new Date()
      }
    }))

    dummyUsers.forEach(dummyUser => {
      users.push(dummyUser)
    })

    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.bulkInsert('Users', users, { transaction })
      await transaction.commit()
    } catch (err) {
      console.error(err)
      await transaction.rollback()
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null)
  }
}
