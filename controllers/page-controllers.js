const { User, Student, Reservation, Sequelize } = require('../models')
const pagination = require('../helpers/pagination-helpers')

const pageControllers = {
  async getTutorsAndRankings (req, res, next) {
    try {
      const RECORDS_PER_PAGE = 9
      const currentPage = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || RECORDS_PER_PAGE
      const offset = (currentPage - 1) * limit
      let [
        { count: amountOfTeachers, rows: usersWithTeacherStatus },
        studentRankings
      ] = await Promise.all([
        User.findAndCountAll({
          attributes: { exclude: ['password'] },
          where: { status: 'teacher' },
          limit,
          offset
        }),
        Reservation.findAll({
          attributes: [
            'studentId',
            [Sequelize.fn('SUM', Sequelize.col('duration_hours')), 'totalLearningTime']
          ],
          where: { isExpired: true },
          include: [
            {
              model: Student,
              attributes: ['userId'],
              include: [
                {
                  model: User,
                  attributes: ['name', 'avatar']
                }
              ]
            }
          ],
          group: 'studentId',
          order: [['totalLearningTime', 'DESC']],
          limit: 10
        })
      ])
      studentRankings = studentRankings.map(r => r.toJSON())
      usersWithTeacherStatus = usersWithTeacherStatus.map(u => u.toJSON())

      const paginators = pagination.generatePaginatorForRender(amountOfTeachers, currentPage, limit)

      const learingTimes = []
      studentRankings.forEach(r => {
        if (!learingTimes.includes(r.totalLearningTime)) {
          learingTimes.push(r.totalLearningTime)
        }
        r.ranking = learingTimes.length
      })

      return res.render('tutor/tutors-and-rankings', {
        usersWithTeacherStatus,
        studentRankings,
        paginators
      })
    } catch (err) {
      return next(err)
    }
  }
}

module.exports = pageControllers
