const Decimal = require('decimal.js')

function preciseRound (number, digits) {
  return new Decimal(number).toFixed(digits)
}

module.exports = {
  preciseRound
}
