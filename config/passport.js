const passport = require('passport')
const LocalStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth20')
const bcrypt = require('bcryptjs')

const { User, Student, sequelize } = require('../models')

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

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_OAUTH20_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH20_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_OAUTH20_REDIRECT_URL,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, cb) => {
    // top try catch start
    try {
      const name = profile.displayName
      const email = profile.emails[0].value
      const user = await User.findOne({ where: { email } })
      let createdUser

      if (user) {
        return cb(null, user)
      } else {
        const transaction = await sequelize.transaction()
        // transaction try catch start
        try {
          const hash = await bcrypt.hash(Math.random().toString(36).slice(-8), 10)

          createdUser = await User.create({
            name,
            email,
            password: hash
          }, { transaction })

          await Student.create({ userId: createdUser.id }, { transaction })

          await transaction.commit()
        } catch (err) {
          await transaction.rollback()
          console.error('[ERROR] Error occurred while creating user data for google oauth user:', err)
          return cb(null, false, req.flash('error_messages', '資料庫端發生錯誤!!請再試一次或是回報錯誤給我們，或是選擇註冊本地帳號密碼'))
          // return cb(err) // 不用這個是因為出錯了使用者會無法得到正確的錯誤指引
        }
        // transaction try catch end

        return cb(null, createdUser)
      }
    } catch (err) {
      console.error('[ERROR] Error occurred while verifing google oauth user:', err)
      return cb(null, false, req.flash('error_messages', 'google 快速登入發生錯誤!!請再試一次或是回報錯誤給我們，或是選擇註冊本地帳號密碼'))
      // return cb(err) // 不用這個是因為出錯了使用者會沒有辦法得到正確的錯誤指引
    }
    // top try catch end
  }
))

passport.serializeUser((user, cb) => {
  return cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  return User.findByPk(id, {
    attributes: { exclude: ['password'] },
    include: [
      { model: Student }
    ]
  })
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})

module.exports = passport
