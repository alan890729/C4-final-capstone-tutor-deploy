const bcrypt = require('bcryptjs')
const ct = require('countries-and-timezones')

const { User, Student, Teacher, AvailableDay, LessonDurationMinute, DaysPerWeek, Reservation, Comment, sequelize, Sequelize } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')
const { preciseRound } = require('../helpers/math-helpers')
const reservationTimeHelpers = require('../helpers/reservation-time-helpers')

const userControllers = {
  getSignup (req, res, next) {
    return res.render('signup')
  },

  async postSignup (req, res, next) {
    try {
      const name = req.body.name?.trim()
      const email = req.body.email?.trim()
      const { password, passwordConfirm } = req.body
      if (!email) throw new Error('Email is required!')
      if (!password || password !== passwordConfirm) throw new Error('Password should be equal to password confirm!')

      const transaction = await sequelize.transaction()

      try {
        const user = await User.findOne({ where: { email } })
        if (user) throw new Error('User existed, try another email.')

        const hash = await bcrypt.hash(password, 10)

        const createdUser = await User.create({
          name,
          email,
          password: hash
        }, { transaction })

        await Student.create({
          userId: createdUser.id
        }, { transaction })

        await transaction.commit()
      } catch (err) {
        await transaction.rollback()
        throw err
      }

      req.flash('success_messages', '註冊成功!')
      return res.redirect('/signin')
    } catch (err) {
      return next(err)
    }
  },

  getSignin (req, res, next) {
    return res.render('signin')
  },

  postSignin (req, res, next) {
    req.flash('success_messages', '登入成功!')

    if (req.user.status === 'admin') return res.redirect('/admin') // 之後改成導到後臺主頁
    return res.redirect('/tutor')
  },

  postLogout (req, res, next) {
    req.logout(err => {
      if (err) return next(err)
      req.flash('success_messages', '登出成功!')
      return res.redirect('/signin')
    })
  },

  async getProfile (req, res, next) {
    try {
      const targetUserId = Number(req.params.userId)
      const currentUserId = req.user.id

      if (targetUserId === currentUserId) {
        const user = res.locals.user
        if (user.status === 'student') {
          const futureReservations = await Reservation.findAll({
            where: {
              studentId: user.Student.id,
              isExpired: false
            },
            include: [{ model: Teacher, include: [{ model: User, exclude: ['password'] }] }],
            order: [['startFrom', 'ASC']]
          })
          const pastReservations = await Reservation.findAll({
            where: {
              studentId: user.Student.id,
              isExpired: true
            },
            include: [
              { model: Teacher, include: [{ model: User, exclude: ['password'] }] },
              { model: Comment }
            ],
            order: [['startFrom', 'DESC']]
          })
          let learingTimeSort = await Reservation.findAll({
            attributes: [
              'studentId',
              [Sequelize.fn('SUM', Sequelize.col('duration_hours')), 'totalLearningTime']
            ],
            where: { isExpired: true },
            group: 'studentId',
            order: [['totalLearningTime', 'DESC']]
          })
          learingTimeSort = learingTimeSort.map(t => t.toJSON())
          const totalLearningTime = learingTimeSort.find(t => t.studentId === user.Student.id)?.totalLearningTime

          user.futureReservations = futureReservations.map(r => r.toJSON())
          user.pastReservations = pastReservations.map(r => r.toJSON())
          user.ranking = learingTimeSort.findIndex(t => t.totalLearningTime === totalLearningTime) + 1
          user.totalLearningTime = totalLearningTime
        } else if (user.status === 'teacher') {
          const [rating] = await Comment.findAll({
            attributes: [[Sequelize.fn('AVG', Sequelize.col('rate')), 'avgRating']],
            where: { teacherId: user.Teacher.id }
          })
          const futureReservations = await Reservation.findAll({
            where: {
              teacherId: user.Teacher.id,
              isExpired: false
            },
            include: [{ model: Student, include: [{ model: User, exclude: ['password'] }] }],
            order: [['startFrom', 'ASC']]
          })
          const comments = await Comment.findAll({
            where: { teacherId: user.Teacher.id },
            order: [['createdAt', 'DESC']]
          })

          user.rating = rating.toJSON().avgRating ? preciseRound(rating.toJSON().avgRating, 1) : undefined
          user.futureReservations = futureReservations.map(r => r.toJSON())
          user.comments = comments.map(c => c.toJSON())
        }

        return res.render('user/profile')
      } else {
        let targetUser = await User.findByPk(targetUserId, {
          attributes: ['status']
        })
        if (!targetUser) throw new Error('User not found!')
        if (targetUser.status === 'student' || targetUser.status === 'admin') throw new Error('不能查看其他學生的個人資料!')

        targetUser = await User.findByPk(targetUserId, {
          attributes: { exclude: ['password'] },
          include: [
            {
              model: Teacher,
              include: [
                { model: AvailableDay },
                { model: LessonDurationMinute }
              ]
            }
          ]
        })

        const [rating] = await Comment.findAll({
          attributes: [[Sequelize.fn('AVG', Sequelize.col('rate')), 'avgRating']],
          where: { teacherId: targetUser.Teacher.id }
        })
        const comments = await Comment.findAll({
          attributes: ['text', 'rate'],
          where: { teacherId: targetUser.Teacher.id },
          order: [['createdAt', 'DESC']]
        })
        targetUser = targetUser.toJSON()
        targetUser.rating = rating.toJSON().avgRating ? preciseRound(rating.toJSON().avgRating, 1) : undefined
        targetUser.comments = comments.map(c => c.toJSON())

        if (req.user.Student) {
          let teacherReservedLessons = await Reservation.findAll({
            where: {
              teacherId: targetUser.Teacher.id,
              isExpired: false
            }
          })
          let studentReservedLessons = await Reservation.findAll({
            where: {
              studentId: req.user.Student.id,
              isExpired: false
            }
          })
          teacherReservedLessons = teacherReservedLessons.map(r => r.toJSON())
          studentReservedLessons = studentReservedLessons.map(r => r.toJSON())
          const teacherAvailableDays = targetUser.Teacher.AvailableDays.map(day => day.day)
          const perLessonDuration = targetUser.Teacher.LessonDurationMinute.durationMinute
          targetUser.teacherAvailableDaysInTwoWeeks = reservationTimeHelpers.teacherAvailableDaysInTwoWeeks(teacherAvailableDays, perLessonDuration, teacherReservedLessons, studentReservedLessons)
        }

        return res.render('user/profile', { targetUser })
      }
    } catch (err) {
      return next(err)
    }
  },

  getProfileEditPage (req, res, next) {
    const targetUserId = Number(req.params.userId)
    const currentUser = req.user
    if (targetUserId !== currentUser.id) throw new Error('User didn\'t exist!')

    res.locals.countries = Object.values(ct.getAllCountries())
    if (currentUser.status === 'student') return res.render('user/edit-profile')

    return Promise.all([
      LessonDurationMinute.findAll({
        attributes: ['id', 'durationMinute'],
        raw: true
      }),
      DaysPerWeek.findAll({
        attributes: ['name', 'day'],
        raw: true
      })
    ])
      .then(([lessonDurationMinutes, daysPerWeek]) => {
        const checkedDays = req.user.Teacher.AvailableDays
        daysPerWeek.forEach(day => {
          day.isChecked = checkedDays.some(checkedDay => checkedDay.day === day.day)
        })

        return res.render('user/edit-profile', { lessonDurationMinutes, daysPerWeek })
      })
      .catch(err => next(err))
  },

  async editProfile (req, res, next) {
    try {
      const userId = Number(req.params.userId)
      const currentUser = req.user
      if (currentUser.id !== userId) throw new Error('User didn\'t exist!')

      const name = req.body.name?.trim()
      const countryCode = req.body.countryCode
      const selfIntro = req.body.selfIntro?.trim()
      const file = req.file
      if (!name) throw new Error('name is required!')
      if (countryCode !== '' && !ct.getCountry(countryCode)) throw new Error('Invalid input on country code!')

      let transaction
      if (currentUser.status === 'student') {
        const [user, filePath] = await Promise.all([
          User.findByPk(userId),
          localFileHandler(file)
        ])

        if (!user) throw new Error('User didn\'t exist!')

        transaction = await sequelize.transaction()
        try {
          await user.update({
            name,
            selfIntro,
            countryCode,
            avatar: filePath || user.avatar
          }, { transaction })

          await transaction.commit()
          return res.redirect(`/user/profile/${userId}`)
        } catch (err) {
          await transaction.rollback()
          throw err
        }
      }

      const classIntro = req.body.classIntro?.trim()
      const teachingStyle = req.body.teachingStyle?.trim()
      const classLink = req.body.classLink?.trim()
      let availableDays = req.body.availableDays
      const lessonDurationMinuteId = Number(req.body.lessonDurationMinuteId)
      if (!classIntro || !teachingStyle || !classLink) throw new Error('class intro, teaching style, class link are required!')
      if (!availableDays) throw new Error('You must selected at least one available day!')
      if (typeof availableDays === 'string') {
        availableDays = Number(availableDays)
        if (availableDays < 0 || availableDays > 6 || !Number.isInteger(availableDays)) throw new Error('Invalid input on available days!')
        availableDays = [availableDays]
      } else if (Array.isArray(availableDays)) {
        availableDays = availableDays.map(day => {
          day = Number(day)
          if (day < 0 || day > 6 || !Number.isInteger(day)) throw new Error('Invalid input on available days!')
          return day
        })
      } else {
        throw new Error('Invalid input on available days!')
      }
      if (!lessonDurationMinuteId || lessonDurationMinuteId < 1 || !Number.isInteger(lessonDurationMinuteId)) throw new Error('Invalid input on lesson duration minute id!')

      const [user, teacher, filePath] = await Promise.all([
        User.findByPk(userId),
        Teacher.findOne({ where: { userId } }),
        localFileHandler(file)
      ])

      if (!user) throw new Error('User didn\'t exist!')

      transaction = await sequelize.transaction()
      try {
        await user.update({
          name,
          selfIntro,
          countryCode,
          avatar: filePath || user.avatar
        }, { transaction })

        await teacher.update({
          classIntro,
          teachingStyle,
          classLink,
          lessonDurationMinuteId
        }, { transaction })

        const originalAvailableDays = await AvailableDay.findAll({
          where: { teacherId: teacher.id }
        })
        await Promise.all(availableDays.map(async newDay => {
          if (!originalAvailableDays.some(oldDay => oldDay.day === newDay)) {
            return AvailableDay.create({
              day: newDay,
              teacherId: teacher.id
            }, { transaction })
          }
        }))
        await Promise.all(originalAvailableDays.map(async oldDay => {
          if (!availableDays.some(newDay => newDay === oldDay.day)) {
            return oldDay.destroy({ transaction })
          }
        }))

        await transaction.commit()
        return res.redirect(`/user/profile/${userId}`)
      } catch (err) {
        await transaction.rollback()
        throw err
      }
    } catch (err) {
      return next(err)
    }
  }
}

module.exports = userControllers
