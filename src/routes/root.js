const repo = require('../../package')
const debug = {
  name: repo.name
}

module.exports = {
  method: 'get',
  path: '/',
  handler: (req, res) => {
    res.json(debug)
  }
}
