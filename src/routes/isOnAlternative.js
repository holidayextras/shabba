const splitTests = require('../../config/tests')
const utils = require('../utils')

const isOnAlternative = module.exports = {
  method: 'get',
  path: '/isOnAlternative/:name'
}

// no reason to actually return json obj here,
// leaving it here while debugging though
// thinking of just returning status codes
isOnAlternative.handler = (req, res) => {
  const experiment = splitTests[req.params.name]
  const reasonToSkipExperiment = utils.reasonToSkipExperiment(experiment, req.query)
  if (reasonToSkipExperiment) {
    return res.json({
      reason: reasonToSkipExperiment,
      ok: false
    })
  }

  const bucketReason = utils.getBucketReason(req, experiment)
  if (bucketReason) return res.json(bucketReason)

  let response = utils.randomResponse(experiment)
  const variant = utils.variantName(response.ok)
  utils.addToBucket(experiment, variant, req, res)
  utils.track(experiment, variant, 'start', req.getContext())
  res.json(response)
}
