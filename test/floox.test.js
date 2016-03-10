'use strict';

const should = require('should');

const createFloox = require('../dist');


function shouldBeValidFloox(floox) {
  it('should have the right properties', () => {
    should(floox).be.an.Object();

    floox.should.have.properties([
      'stores',
      'actions',
      'createStore',
      'createAction',
    ]);

    should(floox.stores).be.an.Object();
    should(floox.actions).be.an.Object();

    should(floox.createStore).be.a.Function();
    should(floox.createAction).be.a.Function();
  });
}

describe('Floox created by a factory', () => {
  const floox = createFloox();

  shouldBeValidFloox(floox);
});
