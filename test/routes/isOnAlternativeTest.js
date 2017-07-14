const sinon = require('sinon')
const sandbox = sinon.sandbox.create()
const isOnAlternative = require('../../src/routes/isOnAlternative')

describe('isOnAlternative', function () {
  afterEach(function () {
    sandbox.restore()
  })

  describe('handler', function () {
    it('is a function', function () {
      expect(isOnAlternative.handler).to.be.a('function')
    })
  })
})
