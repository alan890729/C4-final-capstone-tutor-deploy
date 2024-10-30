const bcrypt = require('bcryptjs')

const { User, Student, Teacher, AvailableDay, sequelize } = require('../models')

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
              { model: Teacher, include: [{ model: AvailableDay }] }
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
  }
}

module.exports = userControllers
