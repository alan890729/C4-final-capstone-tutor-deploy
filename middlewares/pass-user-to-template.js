module.exports = {
  passUserToTemplate (req, res, next) {
    res.locals.user = req.user
    return next()
  }
}
