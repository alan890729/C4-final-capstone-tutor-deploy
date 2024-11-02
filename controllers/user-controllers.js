const bcrypt = require('bcryptjs')

const { User, Student, Teacher, AvailableDay, LessonDurationMinute, DaysPerWeek, sequelize } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

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
    return res.redirect('/') // 之後改成導到前台主頁
  },

  postLogout (req, res, next) {
    req.logout(err => {
      if (err) return next(err)
      req.flash('success_messages', '登出成功!')
      return res.redirect('/signin')
    })
  },

  getProfile (req, res, next) {
    const targetUserId = Number(req.params.userId)
    const currentUserId = req.user.id

    if (targetUserId === currentUserId) {
      return res.render('user/profile')
    } else {
      return User.findByPk(targetUserId, {
        attributes: ['status']
      })
        .then(user => {
          if (!user) throw new Error('User not found!')
          if (user.status === 'student' || user.status === 'admin') throw new Error('不能查看其他學生的個人資料!')

          return User.findByPk(targetUserId, {
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
        })
        .then(userWithTeacherStatus => {
          const targetUser = userWithTeacherStatus.toJSON()
          targetUser.Teacher.AvailableDays = userWithTeacherStatus.Teacher.AvailableDays.map(day => day.day)

          res.render('user/profile', { targetUser })
        })
        .catch(err => next(err))
    }
  },

  getProfileEditPage (req, res, next) {
    const targetUserId = Number(req.params.userId)
    const currentUser = req.user
    if (targetUserId !== currentUser.id) throw new Error('User didn\'t exist!')
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
      const selfIntro = req.body.selfIntro?.trim()
      const file = req.file
      if (!name) throw new Error('name is required!')

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
