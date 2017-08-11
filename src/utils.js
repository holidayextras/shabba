const dataPlatform = require('node-toolbox').dataPlatform

const utils = module.exports = {}

utils.track = (experiment = {}, variant = '', step = 'start', ctx) => {
  // cannot call tracker server side, we can only call orion directly...
  // node-toolbox provides a helper
  const payload = {
    step,
    test_name: experiment.name,
    variant,
    percentage: '' + experiment.percentage
  }
  dataPlatform.publish(ctx, 'test', payload)
  return payload
}

utils.reasonToSkipExperiment = (experiment, params) => {
  // while developing is handy to return a truthy here, but could return true / false
  if (!experiment) return 'no such test'

  if (!experiment.percentage) return 'test is turned off'

  // if one of our params we passed in is not in the "include" list then we are not in this split test
  if (experiment.include) {
    for (const key in experiment.include) {
      if (experiment.include[key].indexOf(params[key]) === -1) {
        return 'params.' + key + ' "' + params[key] + '" is not in include ' + JSON.stringify(experiment.include[key])
      }
    }
  }
  // if one of our params we passed in *is* in the "exclude" list then we are also not in this split test
  if (experiment.exclude) {
    for (const key in experiment.exclude) {
      if (experiment.exclude[key].indexOf(params[key]) !== -1) {
        return 'params.' + key + ' "' + params[key] + '" is in exclude ' + JSON.stringify(experiment.exclude[key])
      }
    }
  }
  return false
}

utils.cookieName = experiment => {
  if (!experiment) return ''
  return encodeURIComponent(experiment.name + ' (' + process.env.NODE_ENV + ')')
}

utils.removeFromBucket = (experiment = {}, req, res) => {
  const name = utils.cookieName(experiment)
  // remove the subdomain if there is one
  const domain = ('' + req.host).replace(/^.*?\./, '.')
  const expires = -1
  const options = { domain, expires }
  res.cookie(name, null)
  return { name, options }
}

utils.addToBucket = (experiment = {}, value, req, res) => {
  const name = utils.cookieName(experiment)
  if (utils.isAlternative(value)) {
    value = value + '_' + experiment.percentage
  }
  // remove the subdomain if there is one
  const domain = ('' + req.host).replace(/^.*?\./, '.')
  const options = { domain }
  res.cookie(name, value)
  return { name, value, options }
}

utils.variantName = ok => ok ? 'show_alternative' : 'show_original'

utils.isAlternative = value => /show_alternative/.test(value)

utils.randomResponse = (experiment = {}) => {
  const randomNumber = Math.random() * 100
  return {
    ok: randomNumber < experiment.percentage,
    reason: 'compared random number ' + randomNumber + ' with split % ' + experiment.percentage
  }
}

// right now read a cookie
// in future identify this user and look up in data somwhere
utils.getBucketReason = (req = {}, experiment = {}) => {
  if (experiment.percentage >= 100) {
    return {
      reason: 'test is ON, so out of your show_original bucket...',
      ok: true
    }
  }
  const cookieName = utils.cookieName(experiment)
  if (!req.cookies) return false
  if (!req.cookies[cookieName]) return false
  return {
    reason: 'already bucketed (cookie ' + cookieName + ' set to ' + req.cookies[cookieName] + ')',
    ok: utils.isAlternative(req.cookies[cookieName])
  }
}
