'use strict';

const should = require('should/as-function');

const floox = require('../dist');
const connectFloox = require('../dist/connect_floox');
const Floox = require('../dist/floox_class');
const FlooxProvider = require('../dist/floox_provider');


describe('index', () => {
  it('should have appropriate exports', () => {
    should(floox).have.keys('connectFloox', 'Floox', 'FlooxProvider');
    should(floox.connectFloox).be.equal(
      connectFloox,
      'expected floox.connectFloox to have the right value'
    );
    should(floox.Floox).be.equal(
      Floox,
      'expected floox.Floox to have the right value'
    );
    should(floox.FlooxProvider).be.equal(
      FlooxProvider,
      'expected floox.FlooxProvider to have the right value'
    );
  });
});
