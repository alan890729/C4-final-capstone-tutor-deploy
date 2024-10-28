function generalErrorHandler (err, req, res, next) {
  if (err instanceof Error) {
    req.flash('error_messages', `${err.name}: ${err.message}`)
  } else {
    req.flash('error_messages', `${err}`)
  }

  res.redirect(req.get('Referer'))

  return next(err)
}

module.exports = {
  generalErrorHandler
}
