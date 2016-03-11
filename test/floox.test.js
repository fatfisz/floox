'use strict';

const should = require('should');

const createFloox = require('../dist').createFloox;


function shouldBeValidFloox(floox) {
  it('should have the right properties', () => {
    should(floox).be.an.Object();

    floox.should.have.keys([
      'store',
      'actions',
      'createAction',
      'StateFromStoreMixin',
    ]);

    should(floox.store).be.an.Object();
    should(floox.actions).be.an.Object();
    should(floox.createAction).be.a.Function();
  });
}

describe('Floox created by a factory', () => {
  const floox = createFloox({});

  shouldBeValidFloox(floox);
});
