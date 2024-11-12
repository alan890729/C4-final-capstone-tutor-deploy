const { User, Student, Reservation, Sequelize, sequelize } = require('../models')
const { QueryTypes } = sequelize
const pagination = require('../helpers/pagination-helpers')

const pageControllers = {
  async getTutorsAndRankings (req, res, next) {
    try {
      const RECORDS_PER_PAGE = 9
      const currentPage = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || RECORDS_PER_PAGE
      const offset = (currentPage - 1) * limit
      const keyword = req.query.keyword?.trim() || ''
      let [amountOfTeachers, usersWithTeacherStatus, studentRankings] = await Promise.all([
        sequelize.query(`
          SELECT COUNT(*) AS amount_of_teachers FROM Users
          LEFT OUTER JOIN Teachers
          ON Teachers.user_id = Users.id
          WHERE (Users.status = 'teacher' AND Users.name LIKE '%${keyword}%') OR (Users.status = 'teacher' AND Teachers.class_intro LIKE '%${keyword}%');
        `, {
          type: QueryTypes.SELECT
        }),
        sequelize.query(`
          SELECT Users.id,
                 Users.name,
                 Users.avatar,
                 Users.country_code,
                 Teachers.class_intro
          FROM Users
          LEFT OUTER JOIN Teachers
          ON Teachers.user_id = Users.id
          WHERE (Users.status = 'teacher' AND Users.name LIKE '%${keyword}%') OR (Users.status = 'teacher' AND Teachers.class_intro LIKE '%${keyword}%')
          LIMIT ${limit}
          OFFSET ${offset};
        `, {
          type: QueryTypes.SELECT
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
      // console.log('amountOfTeachers:', amountOfTeachers)
      // console.log('usersWithTeacherStatus', usersWithTeacherStatus)
      amountOfTeachers = amountOfTeachers[0].amount_of_teachers
      studentRankings = studentRankings.map(r => r.toJSON())

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
        paginators,
        keyword
      })
    } catch (err) {
      return next(err)
    }
  }
}

module.exports = pageControllers
