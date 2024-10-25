function generalMessageHandler (req, res, next) {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  return next()
}

module.exports = {
  generalMessageHandler
}
