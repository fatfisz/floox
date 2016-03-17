'use strict';

const should = require('should/as-function');

const floox = require('../dist');
const FlooxConnector = require('../dist/floox_connector');
const FlooxProvider = require('../dist/floox_provider');


describe('index', () => {
  it('should have appropriate exports', () => {
    should(floox).have.keys('FlooxConnector', 'FlooxProvider');
    should(floox.FlooxConnector).be.equal(
      FlooxConnector,
      'expected floox.FlooxConnector to have the right value'
    );
    should(floox.FlooxProvider).be.equal(
      FlooxProvider,
      'expected floox.FlooxProvider to have the right value'
    );
  });
});
