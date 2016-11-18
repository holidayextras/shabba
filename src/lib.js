'use strict'

const lib = module.exports = {}

lib.set = function (name, value, options) {
  var cookie, expires
  if (!options) options = {}
  if (options.expires === true) {
    options.expires = -1
  }
  if (typeof options.expires === 'number') {
    expires = new Date()
    expires.setTime(expires.getTime() + options.expires * 24 * 60 * 60 * 1000)
    options.expires = expires
  }
  value = (value + '').replace(/[^!#-+\--:<-\[\]-~]/g, encodeURIComponent)
  cookie = encodeURIComponent(name) + '=' + value
  if (options.expires) {
    cookie += ';expires=' + options.expires.toGMTString()
  }
  if (options.path) {
    cookie += ';path=' + options.path
  }
  if (options.domain) {
    cookie += ';domain=' + options.domain
  }
  document.cookie = cookie
  return cookie
}

lib.get = function (name) {
  var cookie, cookies, i, index, key, len, value
  cookies = document.cookie.split('; ')
  for (i = 0, len = cookies.length; i < len; i++) {
    cookie = cookies[i]
    index = cookie.indexOf('=')
    key = decodeURIComponent(cookie.substr(0, index))
    value = decodeURIComponent(cookie.substr(index + 1))
    if (key === name) {
      return value
    }
  }
  return null
}
