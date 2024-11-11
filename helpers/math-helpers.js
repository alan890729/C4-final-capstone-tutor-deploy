const Decimal = require('decimal.js')

function preciseRound (number, digits) {
  return new Decimal(number).toFixed(digits)
}

function preciseDividedBy (a, b, dp) {
  // dp stands for decimal places
  return new Decimal(a).dividedBy(new Decimal(b)).toFixed(dp)
}

module.exports = {
  preciseRound,
  preciseDividedBy
}
