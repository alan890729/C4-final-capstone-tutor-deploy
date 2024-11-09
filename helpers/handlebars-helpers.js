const ct = require('countries-and-timezones')
const dayjs = require('dayjs')

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
  },

  formatDatetime (datetime) {
    return dayjs(datetime).format('YYYY-MM-DD HH:mm:ss (dddd)')
  },

  formatDateTimeCustom (datetime, format) {
    return dayjs(datetime).format(format)
  }
}

module.exports = handlebarsHelpers
