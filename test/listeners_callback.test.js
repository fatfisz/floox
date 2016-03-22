'use strict';

const mockery = require('mockery');
const should = require('should/as-function');
const sinon = require('sinon');


describe('listenersCallback function', () => {
  let cleanup;
  let listenersCallback;

  beforeEach(() => {
    cleanup = sinon.spy();

    mockery.registerMock('./cleanup', cleanup);

    listenersCallback = require('../dist/listeners_callback');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should export a function that accepts one argument', () => {
    should(listenersCallback).be.a.Function();
    should(listenersCallback).have.a.length(1);
  });

  it('should set data to appropriate values', () => {
    const data = {
      listenersLeft: 3,
    };

    listenersCallback(data);

    should(data).be.eql({
      listenersLeft: 2,
    });
  });

  it('should call `cleanup` if there is one listener left', () => {
    const data = {
      listenersLeft: 1,
    };

    listenersCallback(data);

    should(cleanup).be.calledOnce();
    should(cleanup).be.calledWithExactly(data);
  });

  it('shouldn\'t call `cleanup` if there are more than one listeners left', () => {
    const data = {
      listenersLeft: 2,
    };

    listenersCallback(data);

    should(cleanup).not.be.called();
  });
});
