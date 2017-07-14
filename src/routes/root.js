const splitTests = require('../../config/tests')
const repo = require('../../package')
let debug = {
  name: repo.name
}

if (process.env.NODE_ENV !== 'production') {
  debug.description = repo.description
  debug.splitTests = splitTests
}

module.exports = {
  method: 'get',
  path: '/',
  handler: (req, res) => {
    res.json(debug)
  }
}
