if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

const path = require('path')
const express = require('express')
const { create } = require('express-handlebars')
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')

const passport = require('./config/passport')
const routes = require('./routes')
const { generalMessageHandler } = require('./middlewares/messages-handler')
const { generalErrorHandler } = require('./middlewares/error-handler')
const { passUserToTemplate } = require('./middlewares/pass-user-to-template')
const handlebarsHelpers = require('./helpers/handlebars-helpers')

const hbs = create({
  extname: '.hbs',
  helpers: handlebarsHelpers
})
const app = express()
const port = 3000

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', './views')

app.use('/public', express.static(path.resolve(__dirname, 'public')))
app.use('/upload', express.static(path.resolve(__dirname, 'upload')))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(generalMessageHandler)
app.use(passUserToTemplate)

app.use(routes)

app.use(generalErrorHandler)

app.listen(port, () => {
  console.log(`express server running on http://localhost:${port}`)
})
