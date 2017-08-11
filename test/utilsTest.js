const sinon = require('sinon')
const sandbox = sinon.sandbox.create()
const utils = require('../src/utils')
const dataPlatform = require('node-toolbox').dataPlatform

describe('utils', function () {
  let env = null

  beforeEach(function () {
    env = process.env.NODE_ENV
  })

  afterEach(function () {
    process.env.NODE_ENV = env
    sandbox.restore()
  })

  describe('track', function () {
    beforeEach(function () {
      sandbox.stub(dataPlatform, 'publish')
      const context = {
        foo: 'bar'
      }
      const experiment = {
        name: 'foo',
        percentage: 66
      }
      utils.track(experiment, 'VARIANT', 'STEP', context)
    })

    it('actually does some tracking', function () {
      const expected = {
        step: 'STEP',
        test_name: 'foo',
        variant: 'VARIANT',
        percentage: '66'
      }
      expect(dataPlatform.publish).to.have.been.calledOnce()
        .and.calledWithExactly({ foo: 'bar' }, 'test', expected)
    })

    it('returns an object so we can handle the tracking externally', function () {
      expect(utils.track()).to.be.an('object')
        .that.has.all.keys('step', 'test_name', 'variant', 'percentage')
    })
  })

  describe('reasonToSkipExperiment', function () {
    it('tells us to return early if a test does not exist', function () {
      expect(utils.reasonToSkipExperiment()).to.be.ok() // truthy, but a string right now
    })

    it('tells us to return early if a test has no percentage', function () {
      expect(utils.reasonToSkipExperiment({})).to.be.ok() // truthy, but a string right now
    })

    it('tells us to return early if a test is turned off', function () {
      expect(utils.reasonToSkipExperiment({ percentage: 0 })).to.be.ok() // truthy, but a string right now
    })

    it('tells us to return early if not meeting include prerequisites', function () {
      const params = { foo: 1 }
      const experiment = {
        percentage: 50,
        include: {
          foo: [2, 3]
        }
      }
      expect(utils.reasonToSkipExperiment(experiment, params)).to.be.ok() // truthy, but a string right now
    })

    it('tells us to return early if not meeting exclude prerequisites', function () {
      const params = { foo: 1 }
      const experiment = {
        percentage: 50,
        exclude: {
          foo: [1, 2]
        }
      }
      expect(utils.reasonToSkipExperiment(experiment, params)).to.be.ok() // truthy, but a string right now
    })

    it('returns false if we meet all prerequisites', function () {
      const params = { foo: 1 }
      const experiment = {
        percentage: 50,
        include: {
          foo: [1]
        },
        exclude: {
          bar: [2]
        }
      }
      expect(utils.reasonToSkipExperiment(experiment, params)).to.be.false()
    })
  })

  describe('cookieName', function () {
    it('makes a cookie name like tripapp does', function () {
      process.env.NODE_ENV = 'staging'
      expect(utils.cookieName({ name: 'foo_bar' })).to.equal('foo_bar%20(staging)')
    })

    it('is ok with bad data', function () {
      expect(utils.cookieName()).to.equal('')
    })
  })
})
