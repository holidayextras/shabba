const splitTests = require('../../config/tests')
const utils = require('../utils')

const isOnAlternative = module.exports = {
  method: 'get',
  path: '/isOnAlternative/:name'
}

isOnAlternative.handler = (req, res) => {
  const experiment = splitTests[req.params.name]
  const reasonToSkipExperiment = utils.reasonToSkipExperiment(experiment, req.query)
  if (reasonToSkipExperiment) {
    return res.json({
      reason: reasonToSkipExperiment,
      ok: false
    })
  }

  if (experiment.percentage >= 100) {
    return res.json({
      reason: 'test is ON, so out of your show_original bucket...',
      ok: false
    })
  }

  const cookieName = utils.cookieName(experiment)
  if (req.cookies[cookieName]) {
    return res.json({
      reason: 'already had cookie ' + cookieName + ' set to ' + req.cookies[cookieName],
      ok: utils.isAlternative(req.cookies[cookieName])
    })
  }

  let response = utils.randomResponse(experiment)
  const variant = utils.setVariant(response.ok)
  response.cookie = utils.cookie(experiment, variant, req, res)
  response.track = utils.track(experiment, variant, 'start')
  res.json(response)
}
