const express = require('express')
const adminControllers = require('../controllers/admin-controllers')

const router = express.Router()

router.get('/users', adminControllers.getUsers)

router.use('/', (req, res, next) => {
  return res.redirect('/admin/users')
})

module.exports = router
