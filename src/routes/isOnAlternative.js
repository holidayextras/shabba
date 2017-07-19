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
      ok: true
    })
  }

  const bucketReason = utils.getBucketReason(req.cookies, experiment)
  if (bucketReason) return res.json(bucketReason)

  let response = utils.randomResponse(experiment)
  const variant = utils.variantName(response.ok)
  response.cookie = utils.addToBucket(experiment, variant, req, res)
  response.track = utils.track(experiment, variant, 'start')
  res.json(response)
}
