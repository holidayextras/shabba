const sinon = require('sinon')
const toolbox = require('node-toolbox')

describe('server', function () {
  before(function () {
    sinon.stub(toolbox.routing, 'getExpressApp')
    sinon.stub(toolbox.logger, 'info')
    this.server = require('../src/server')
  })

  after(function () {
    toolbox.routing.getExpressApp.restore()
    toolbox.logger.info.restore()
  })

  it('should be true', function () {
    expect(toolbox.logger.info).to.have.been.calledWith("I'm alive!")
  })
})
