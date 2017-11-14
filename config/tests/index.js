// just a helper method until all this loads from a data source

const requireAll = require('require-all')

module.exports = requireAll({
  dirname: __dirname,
  filter: /(.+)\.json$/
})
