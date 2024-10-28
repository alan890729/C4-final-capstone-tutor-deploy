const express = require('express')
const router = express.Router()

const userRoutes = require('./user')
const oauthRoutes = require('./oauth')
const adminRoutes = require('./admin')
const { authenticate, isGeneralUser, isAdmin } = require('../middlewares/auth')

router.use('/user', userRoutes)
router.use('/oauth', oauthRoutes)
router.use('/admin', authenticate, isAdmin, adminRoutes)

router.get('/', authenticate, isGeneralUser, (req, res, next) => {
  return res.render('index')
})

module.exports = router
