const sinon = require('sinon')
const sandbox = sinon.sandbox.create()
const isOnAlternative = require('../../src/routes/isOnAlternative')
const splitTests = require('../../config/tests')
const utils = require('../../src/utils')

describe('isOnAlternative', function () {
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
        isOnAlternative.handler(req, res)
      })

      it('renders some json indicating we are not in experiment', function () {
        const expected = {
          reason: sandbox.match.any, // reason is probably only staying while developing...
          ok: false
        }
        expect(res.json).to.have.been.calledOnce()
          .and.calledWithExactly(expected)
      })
    })

    describe('when we should consider this experiment', function () {
      beforeEach(function () {
        req.params.name = 'dummyTest'
        utils.reasonToSkipExperiment.returns(false)
      })

      describe('when experiment is fully live', function () {
        beforeEach(function () {
          splitTests.dummyTest.percentage = 100
          isOnAlternative.handler(req, res)
        })

        it('renders some json indicating we are in experiment', function () {
          const expected = {
            reason: sandbox.match.any, // reason is probably only staying while developing...
            ok: true
          }
          expect(res.json).to.have.been.calledOnce()
            .and.calledWithExactly(expected)
        })
      })

      describe('when experiment is still running', function () {
        beforeEach(function () {
          splitTests.dummyTest.percentage = 50
          sandbox.stub(utils, 'getBucketReason')
        })

        describe('when we are already bucketed', function () {
          beforeEach(function () {
            utils.getBucketReason.returns('JSON')
            isOnAlternative.handler(req, res)
          })

          it('returns that bucket reason', function () {
            expect(res.json).to.have.been.calledOnce()
              .and.calledWithExactly('JSON')
          })
        })

        describe('when we are not already bucketed', function () {
          beforeEach(function () {
            isOnAlternative.handler(req, res)
          })

          it('renders some json indicating if we are in the experiment or not', function () {
            const expected = {
              reason: sandbox.match.any, // reason is probably only staying while developing...
              ok: sandbox.match.bool
            }
            expect(res.json).to.have.been.calledOnce()
              .and.calledWithExactly(expected)
          })
        })
      })
    })
  })
})
