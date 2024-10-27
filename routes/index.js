const express = require('express')
const router = express.Router()

const userRoutes = require('./user')
const oauthRoutes = require('./oauth')
const { authenticate } = require('../middlewares/auth')

router.use('/user', userRoutes)
router.use('/oauth', oauthRoutes)

router.get('/', authenticate, (req, res, next) => {
  return res.render('index')
})

module.exports = router
