const dayjs = require('dayjs')
const { Reservation, sequelize } = require('../models')

async function reserveExpirationCheck (req, res, next) {
  try {
    const reservations = await Reservation.findAll({
      where: { isExpired: false }
    })

    await Promise.all(reservations.map(async r => {
      if (dayjs(r.endAt).diff() <= 0) {
        const transaction = await sequelize.transaction()
        try {
          await r.update({
            isExpired: true
          })
          await transaction.commit()
        } catch (err) {
          await transaction.rollback()
          throw err
        }
      }
    }))

    return next()
  } catch (err) {
    return next(err)
  }
}

module.exports = reserveExpirationCheck
