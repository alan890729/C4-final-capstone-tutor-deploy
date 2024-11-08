const { User, Student, Reservation, Sequelize } = require('../models')

const pageControllers = {
  getTutorsAndRankings (req, res, next) {
    return Promise.all([
      User.findAll({
        attributes: { exclude: ['password'] },
        where: { status: 'teacher' }
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
      .then(([usersWithTeacherStatus, studentRankings]) => {
        studentRankings = studentRankings.map(r => r.toJSON())
        usersWithTeacherStatus = usersWithTeacherStatus.map(u => u.toJSON())

        const learingTimes = []
        studentRankings.forEach(r => {
          if (!learingTimes.includes(r.totalLearningTime)) {
            learingTimes.push(r.totalLearningTime)
          }
          r.ranking = learingTimes.length
        })

        return res.render('tutor/tutors-and-rankings', { usersWithTeacherStatus, studentRankings })
      })
  }
}

module.exports = pageControllers
