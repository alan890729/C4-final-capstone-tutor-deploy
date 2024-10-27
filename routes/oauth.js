const express = require('express')
const router = express.Router()

const passport = require('../config/passport')
const userControllers = require('../controllers/user-controllers')

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/redirect', passport.authenticate('google', {
  failureRedirect: '/user/signin',
  failureFlash: true
}), userControllers.postSignin)

module.exports = router
