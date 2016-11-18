'use strict';

var chai = require('chai');

chai.config.includeStack = true;

chai.use(require('dirty-chai'));
chai.use(require('sinon-chai'));

global.expect = chai.expect;
global.should = chai.should();
