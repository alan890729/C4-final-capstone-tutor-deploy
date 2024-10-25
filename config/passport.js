const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')

const { User } = require('../models')

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  (req, email, password, cb) => {
    return User.findOne({
      where: { email }
    })
      .then(user => {
        if (!user) return cb(null, false, req.flash('error_messages', 'Wrong email or password!'))

        return bcrypt.compare(password, user.password)
          .then(isMatched => {
            if (!isMatched) return cb(null, false, req.flash('error_messages', 'Wrong email or password!'))

            return cb(null, user)
          })
      })
      .catch(err => cb(err))
  }
))

passport.serializeUser((user, cb) => {
  return cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  return User.findByPk(id, {
    attributes: { exclude: ['password'] }
  })
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})

module.exports = passport
