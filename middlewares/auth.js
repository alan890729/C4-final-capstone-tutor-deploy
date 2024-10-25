const { isAuthenticated } = require('../helpers/auth-helpers')

function authenticate (req, res, next) {
  if (isAuthenticated(req)) {
    return next()
  }

  req.flash('error_messages', '請先登入再進行後續的操作!')
  return res.redirect('/user/signin')
}

module.exports = {
  authenticate
}
