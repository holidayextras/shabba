const splitTests = require('../../config/tests')
const utils = require('../utils')

const complete = module.exports = {
  method: 'get',
  path: '/complete/:name'
}

// no reason to actually return anything here,
// no need to check the response, just fire and forget
// leaving them here while debugging though
// thinking of just returning status codes
complete.handler = (req, res) => {
  const experiment = splitTests[req.params.name]
  const reasonToSkipExperiment = utils.reasonToSkipExperiment(experiment, req.query)
  if (reasonToSkipExperiment) {
    return res.json({
      reason: reasonToSkipExperiment
    })
  }
  const variant = utils.getBucket(req, experiment)
  if (!variant) {
    return res.json({
      reason: 'no variant, you are not in ' + experiment.name
    })
  }

  utils.removeFromBucket(experiment, req, res)
  utils.track(experiment, variant, 'end', req.getContext())
}
