function generalErrorHandler (err, req, res, next) {
  if (err instanceof Error) {
    req.flash('error_messages', `${err.name}: ${err.message}`)
  } else {
    req.flash('error_messages', `${err}`)
  }

  const userStatus = req.user.status
  if (!req.get('Referer')) {
    // redirect back is deprecated due to safety issue on express@4.21.1
    // Suggest using res.redirect('Referer' || '/') instead of res.redirect('back')
    // Since manually enter url won't have Referer, i have to check if Referer exist or not.

    if (userStatus === 'admin') {
      res.redirect('/admin') // 之後改後台主頁
      return next(err)
    } else if (userStatus === 'student' || userStatus === 'teacher') {
      res.redirect('/') // 之後改前台主頁
      return next(err)
    } else {
      res.redirect('/signin')
      return next(err)
    }
  }

  res.redirect(req.get('Referer'))
  return next(err)
}

module.exports = {
  generalErrorHandler
}
