const express = require('express')
const router = express.Router()

const studentControllers = require('../controllers/student-controllers')

router.get('/become-teacher', studentControllers.getBecomeTeacherPage)

module.exports = router
