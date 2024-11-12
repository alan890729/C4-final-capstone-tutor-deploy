const { User, Sequelize } = require('../models')
const pagination = require('../helpers/pagination-helpers')
const { Op } = Sequelize

const adminControllers = {
  async getUsers (req, res, next) {
    try {
      const RECORDS_PER_PAGE = 10
      const currentPage = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || RECORDS_PER_PAGE
      const offset = (currentPage - 1) * limit
      const { count: amountOfUsers, rows: users } = await User.findAndCountAll({
        attributes: ['id', 'name', 'status'],
        where: {
          status: {
            [Op.not]: 'admin'
          }
        },
        limit,
        offset,
        raw: true
      })

      const paginators = pagination.generatePaginatorForRender(amountOfUsers, currentPage, limit)
      return res.render('admin/users', { users, paginators })
    } catch (err) {
      return next(err)
    }
  }
}

module.exports = adminControllers
