const express = require('express')
const userControllers = require('../controllers/user-controllers')

const router = express.Router()

router.get('/profile/:userId', userControllers.getProfile)

module.exports = router
