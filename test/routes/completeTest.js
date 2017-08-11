const sinon = require('sinon')
const sandbox = sinon.sandbox.create()
const complete = require('../../src/routes/complete')
const splitTests = require('../../config/tests')
const utils = require('../../src/utils')

describe('complete', function () {
  let req = null
  let res = null

  beforeEach(function () {
    sandbox.stub(utils, 'track')
    splitTests.dummyTest = {
    }
    req = {
      getContext: sandbox.stub().returns('CONTEXT'),
      cookies: {
      },
      params: {
      }
    }
    res = {
      cookie: sandbox.stub().returns('COOKIE'),
      json: sandbox.stub()
    }
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('handler', function () {
    beforeEach(function () {
      sandbox.stub(utils, 'reasonToSkipExperiment')
    })

    describe('when we should skip this experiment', function () {
      beforeEach(function () {
        utils.reasonToSkipExperiment.returns(true)
        complete.handler(req, res)
      })

      it('renders some json indicating we are not in experiment', function () {
        const expected = {
          reason: sandbox.match.any // reason is probably only staying while developing...
        }
        expect(res.json).to.have.been.calledOnce()
          .and.calledWithExactly(expected)
      })

      it('does not track', function () {
        expect(utils.track).not.to.have.been.called()
      })

      it('does not remove from bucket', function () {
      })
    })
  })
})
