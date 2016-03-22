'use strict';

const mockery = require('mockery');
const should = require('should/as-function');


describe('index', () => {
  let floox;

  beforeEach(() => {
    mockery.registerMock('./connect_floox', 'connect_floox');
    mockery.registerMock('./floox_class', 'floox_class');
    mockery.registerMock('./floox_provider', 'floox_provider');

    floox = require('../dist');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should have appropriate exports', () => {
    should(floox).have.keys('connectFloox', 'Floox', 'FlooxProvider');
    should(floox.connectFloox).be.equal(
      'connect_floox',
      'expected floox.connectFloox to have the right value'
    );
    should(floox.Floox).be.equal(
      'floox_class',
      'expected floox.Floox to have the right value'
    );
    should(floox.FlooxProvider).be.equal(
      'floox_provider',
      'expected floox.FlooxProvider to have the right value'
    );
  });
});
