const express = require('express')
const userControllers = require('../controllers/user-controllers')

const upload = require('../middlewares/multer')

const router = express.Router()

router.get('/profile/:userId/edit', userControllers.getProfileEditPage)
router.put('/profile/:userId/edit', upload.single('avatar'), userControllers.editProfile)
router.get('/profile/:userId', userControllers.getProfile)

module.exports = router
