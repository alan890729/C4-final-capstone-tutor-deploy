const ct = require('countries-and-timezones')

const handlebarsHelpers = {
  ifCondStrictEqual (a, b, options) {
    if (a === b) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },

  countryCodeToName (countryCode) {
    const country = ct.getCountry(countryCode)
    if (!country) return 'not mentioned'
    return country.name
  }
}

module.exports = handlebarsHelpers
