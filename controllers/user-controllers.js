const bcrypt = require('bcryptjs')

const { User, Student, sequelize } = require('../models')

const userControllers = {
  getSignup (req, res, next) {
    return res.render('signup')
  },

  async postSignup (req, res, next) {
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
      return next(err)
    }

    try {
      req.flash('success_messages', '註冊成功!')
      return res.redirect('/user/signin')
    } catch (err) {
      return next(err)
    }
  },

  getSignin (req, res, next) {
    return res.render('signin')
  },

  postSignin (req, res, next) {
    req.flash('success_messages', '登入成功!')
    return res.redirect('/')
  },

  postLogout (req, res, next) {
    req.logout(err => {
      if (err) return next(err)
      req.flash('success_messages', '登出成功!')
      return res.redirect('/user/signin')
    })
  }
}

module.exports = userControllers
