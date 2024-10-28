const { isAuthenticated } = require('../helpers/auth-helpers')

function authenticate (req, res, next) {
  if (isAuthenticated(req)) {
    return next()
  }

  req.flash('error_messages', '請先登入再進行後續的操作!')
  return res.redirect('/user/signin')
}

function isStudent (req, res, next) {
  if (req.user.status === 'student') return next()

  if (req.user.status === 'admin') {
    req.flash('error_messages', '管理者只能查看後台，已將您導向到後台頁面!')
    return res.redirect('/admin') // 後臺頁面出來後改成直接導向後台主頁
  }

  req.flash('error_messages', '您不是學生身分，無法執行該操作!')
  return res.redirect('/') // 前台頁面出來後改成直接導向前台主頁
}

function isTeacher (req, res, next) {
  if (req.user.status === 'teacher') return next()

  if (req.user.status === 'admin') {
    req.flash('error_messages', '管理者只能查看後台，已將您導向到後台頁面!')
    return res.redirect('/admin') // 後臺頁面出來後改成直接導向後台主頁
  }

  req.flash('error_messages', '您不是老師身分，無法執行該操作!')
  return res.redirect('/') // 前台頁面出來後改成直接導向前台主頁
}

function isGeneralUser (req, res, next) {
  if (req.user.status === 'admin') {
    req.flash('error_messages', '管理者只能查看後台，已將您導向到後台頁面!')
    return res.redirect('/admin') // 之後改，後臺頁面出來直接導到那個路由而不是/admin
  }

  return next()
}

function isAdmin (req, res, next) {
  if (req.user.status !== 'admin') {
    req.flash('error_messages', 'No such page exist!')
    return res.redirect('/') // 之後改，前台頁面出來後直接導到該路由而不是/
  }

  return next()
}

module.exports = {
  authenticate,
  isGeneralUser,
  isStudent,
  isTeacher,
  isAdmin
}
