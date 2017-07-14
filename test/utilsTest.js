const sinon = require('sinon')
const sandbox = sinon.sandbox.create()
const utils = require('../src/utils')

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
    /* it('actually does some tracking', function () {
      // can't call tracker server side, still to figure this out...
      expect(tracker.track).to.have.been.calledOnce()
        .and.calledWithExactly('something here')
    }) */

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

/*

utils.cookie = (experiment, value, req, res) => {
  const name = utils.cookieName(experiment)
  if (utils.isAlternative(value)) {
    value = value + '_' + experiment.percentage
  }
  // remove the subdomain if there is one
  const domain = ('' + req.host).replace(/^.*?\./, '.')
  const options = { domain }
  res.cookie(name, value)
  return { name, value, options }
}

utils.setVariant = ok => ok ? 'show_alternative' : 'show_original'

utils.isAlternative = value => /show_alternative/.test(value)

utils.randomResponse = experiment => {
  const randomNumber = Math.random() * 100
  return {
    ok: randomNumber < experiment.percentage,
    reason: 'compared random number ' + randomNumber + ' with split % ' + experiment.percentage
  }
} */
