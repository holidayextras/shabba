const sinon = require('sinon')
const sandbox = sinon.sandbox.create()
const root = require('../../src/routes/root')

describe('root', function () {
  let req = null
  let res = null

  beforeEach(function () {
    res = {
      json: sandbox.stub()
    }
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('handler', function () {
    beforeEach(function () {
      root.handler(req, res)
    })

    it('renders some json', function () {
      expect(res.json).to.have.been.calledOnce()
        .and.calledWithExactly(sandbox.match.object)
    })
  })
})
