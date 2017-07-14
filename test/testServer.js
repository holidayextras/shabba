const sinon = require('sinon')
const sandbox = sinon.sandbox.create()
const toolbox = require('node-toolbox')

describe('server', function () {
  afterEach(function () {
    sandbox.restore()
  })

  let get = null
  let use = null
  before(function () {
    get = sandbox.stub()
    use = sandbox.stub()
    sandbox.stub(toolbox.routing, 'getExpressApp').returns({ get, use })
    sandbox.stub(toolbox.logger, 'info')
    this.server = require('../src/server')
  })

  it('should be true', function () {
    expect(toolbox.logger.info).to.have.been.calledWith("I'm alive!")
  })
})
