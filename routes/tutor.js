const express = require('express')
const router = express.Router()

const pageControllers = require('../controllers/page-controllers')
const reserveExpirationCheck = require('../middlewares/reserve-expiration-check')

router.get('/', reserveExpirationCheck, pageControllers.getTutorsAndRankings)

module.exports = router
