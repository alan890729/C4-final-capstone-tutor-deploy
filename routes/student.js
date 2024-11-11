const express = require('express')
const router = express.Router()

const studentControllers = require('../controllers/student-controllers')

router.post('/become-teacher/:userId', studentControllers.postTeacher)
router.get('/become-teacher', studentControllers.getBecomeTeacherPage)

router.post('/reservation/:teacherId', studentControllers.postReservation)

router.get('/comment/:reservationId', studentControllers.getCommentPage)
router.post('/comment/:reservationId', studentControllers.postComment)

module.exports = router
