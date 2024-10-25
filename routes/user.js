const express = require('express')
const passport = require('../config/passport')

const userControllers = require('../controllers/user-controllers')

const router = express.Router()

router.get('/signup', userControllers.getSignup)
router.post('/signup', userControllers.postSignup)
router.get('/signin', userControllers.getSignin)
router.post('/signin', passport.authenticate('local', { failureFlash: true, failureRedirect: '/user/signin' }), userControllers.postSignin)
router.post('/logout', userControllers.postLogout)

module.exports = router
