const express = require('express')
const userControllers = require('../controllers/user-controllers')

const upload = require('../middlewares/multer')
const reserveExpirationCheck = require('../middlewares/reserve-expiration-check')

const router = express.Router()

router.get('/profile/:userId/edit', userControllers.getProfileEditPage)
router.put('/profile/:userId/edit', upload.single('avatar'), userControllers.editProfile)
router.get('/profile/:userId', reserveExpirationCheck, userControllers.getProfile)

module.exports = router
