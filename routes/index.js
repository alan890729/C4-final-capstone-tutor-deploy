const express = require('express')
const router = express.Router()

const userRoutes = require('./user')
const { authenticate } = require('../middlewares/auth')

router.use('/user', userRoutes)

router.get('/', authenticate, (req, res, next) => {
  return res.render('index')
})

module.exports = router
