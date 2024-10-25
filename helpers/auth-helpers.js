function isAuthenticated (req) {
  return req.isAuthenticated()
}

module.exports = {
  isAuthenticated
}
