/*
 * floox
 * https://github.com/fatfisz/floox
 *
 * Copyright (c) 2015 FatFisz
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');

var createFloox = require('../factory');
var floox = require('../floox');


function shouldBeValidFloox(floox) {
  it('should have the right properties', function () {
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

describe('Floox created by a factory', function () {
  var floox = createFloox();

  shouldBeValidFloox(floox);
});

describe('Floox singleton', function () {
  shouldBeValidFloox(floox);
});
