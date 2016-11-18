'use strict'

const _ = {
  snakeCase: require('lodash/snakeCase'),
  extend: require('lodash/extend')
}
const tracker = require('tracker')
const cookie = require('./lib')
const cookieDefaults = {
  path: '/',
  expires: 28
}

const Shabba = module.exports = function (name, options) {
  if (process.env.NODE_ENV !== 'production') {
    if (!name) {
      throw new Error('Experiment name required')
    }
  }
  if (!(this instanceof Shabba)) {
    return Shabba._singleton(name, options)
  }
  this.name = name
  this.options = options || {}
  this.variants = []
  if (this.options.variants) {
    for (var variantName in this.options.variants) {
      this.variant(variantName, {weight: this.options.variants[variantName]})
    }
  }
  return this
}

Shabba._cache = {}

Shabba.track = function (step, experiment, variant) {
  experiment = _.snakeCase(experiment)
  variant = _.snakeCase(variant)
  if (process.env.NODE_ENV !== 'production') {
    console.log('tracking', step, experiment, variant)
  }
  tracker.track('test', {step: step, test_name: experiment.replace(/[\(\)]/g, ''), variant: variant})
}

Shabba._singleton = function (name, options) {
  name += ' (' + process.env.NODE_ENV + ')' // @todo is process.env ok to use here???
  if (!Shabba._cache[name]) {
    Shabba._cache[name] = new Shabba(name, options)
  } else if (process.env.NODE_ENV !== 'production') {
    if (options) {
      console.warn('we got', name, 'from the cache but you passed in', options, 'this may not do what you expect')
    }
  }
  return Shabba._cache[name]
}

Shabba.prototype.variant = function (name, options) {
  if (typeof name !== 'string') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('Variant name required')
    }
    return this
  }
  options.name = name
  if (!options.weight) options.weight = 1
  this.variants.push(options)
  return this
}

Shabba.start = function (name, options) {
  return this._singleton(name, options).start()
}

Shabba.prototype.start = function () {
  if (!this.variants.length) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(this.name, 'has no variants', this)
    }
    return this
  }
  if (process.env.NODE_ENV !== 'production') {
    if (this.variants[0].name !== 'show_original') {
      console.warn(this.name, 'does not have show_original as control...')
    }
  }
  var v
  var variant = this.getPreviousVariant()
  if (variant) return this // we've already started
  var totalWeight = 0
  for (var i = 0, len = this.variants.length; i < len; i++) {
    v = this.variants[i]
    totalWeight += v.weight
  }
  const randomWeight = Math.random() * totalWeight
  let variantWeight = 0
  for (var j = 0, len1 = this.variants.length; j < len1; j++) {
    variant = this.variants[j]
    variantWeight += variant.weight
    if (variantWeight >= randomWeight) {
      break
    }
  }
  if (!variant) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('No variants added to', this)
    }
    return this
  }
  this.setVariantCookie(variant.name)
  Shabba.track('start', this.name, variant.name)
  return this
}

Shabba.prototype.control = function (name, options) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('control() is depracated')
  }
  // if (!name) name = 'Control'
  options.control = true
  return this.variant(name, options)
}

Shabba.prototype.complete = function () {
  // if (this.hasPersistCompleteCookie()) return
  // if (this.options.persist) {
  //   this.setPersistCompleteCookie()
  // } else {
  this.reset()
  // }
  Shabba.track('complete', this.name, this.getVariantCookie())
}

Shabba.complete = function (name) {
  return this._singleton(name).complete()
}

Shabba.prototype.reset = function () {
  this.removeVariantCookie()
  // this.removePersistCompleteCookie()
  return this
}

Shabba.prototype.getVariantForName = function (name) {
  var v
  return ((function () { // eslint-disable-line
    var i, len, results
    results = []
    for (i = 0, len = this.variants.length; i < len; i++) {
      v = this.variants[i]
      if (v.name === name) {
        results.push(v)
      }
    }
    return results
  }).call(this))[0]
}

Shabba.prototype.cookieName = function () {
  return 'abbaVariant_' + this.name
}

Shabba.prototype.getPreviousVariant = function () {
  var name = this.getVariantCookie()
  return name ? this.getVariantForName(name) : null
}

Shabba.prototype.getVariantCookie = function () {
  return cookie.get(this.cookieName())
}

Shabba.prototype.value = Shabba.prototype.getVariantCookie

Shabba.prototype.setVariantCookie = function (value) {
  return this.setCookie(this.cookieName(), value, {
    expires: this.options.expires
  })
}

Shabba.prototype.removeVariantCookie = function () {
  return this.setCookie(this.cookieName(), '', {expires: true})
}

// Shabba.prototype.persistCookieName = function () {
//   return 'abbaPersistComplete_' + this.name
// }

// Shabba.prototype.setPersistCompleteCookie = function () {
//   return this.setCookie(this.persistCookieName(), '1', {
//     expires: this.options.expires
//   })
// }

// Shabba.prototype.hasPersistCompleteCookie = function () {
//   return Boolean(cookie.get(this.persistCookieName()))
// }

// Shabba.prototype.removePersistCompleteCookie = function () {
//   return this.setCookie(this.persistCookieName(), '', {
//     expires: true
//   })
// }

const addDefaults = _.extend.bind(null, {}, cookieDefaults)

Shabba.prototype.setCookie = function (name, value, options) {
  return cookie.set(name, value, addDefaults(options))
}

Shabba.prototype.is = function (value) {
  return this.getVariantCookie() === value
}

Shabba.prototype.isnt = function (value) {
  return this.getVariantCookie() !== value
}
