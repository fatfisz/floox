'use strict';

const mockery = require('mockery');
const should = require('should/as-function');
const sinon = require('sinon');


describe('cleanup function', () => {
  let cleanup;

  beforeEach(() => {
    cleanup = require('../tmp/cleanup');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should export a function that accepts one argument', () => {
    should(cleanup).be.a.Function();
    should(cleanup).have.a.length(1);
  });

  it('should set data to appropriate values', () => {
    const data = {
      isSetting: true,
      partialStates: ['partial state'],
      callbacks: [() => {}],
    };

    cleanup(data);

    should(data).be.eql({
      isSetting: false,
      partialStates: [],
      callbacks: [],
    });
  });

  it('should call callbacks in the queue', () => {
    const callback1 = sinon.spy();
    const callback2 = sinon.spy();
    const callback3 = sinon.spy();
    const data = {
      partialStates: [],
      callbacks: [callback1, callback2, callback3],
    };

    cleanup(data);

    should(callback1).be.calledOnce();
    should(callback1).be.calledWithExactly();
    should(callback2).be.calledOnce();
    should(callback2).be.calledWithExactly();
    should(callback3).be.calledOnce();
    should(callback3).be.calledWithExactly();
  });

  it('should not call any callbacks added from within callbacks', () => {
    const callback = sinon.spy(() => {
      data.callbacks.push(sadCallback);
    });
    const sadCallback = sinon.spy();
    const data = {
      partialStates: [],
      callbacks: [callback],
    };

    cleanup(data);

    should(callback).be.called();
    should(sadCallback).not.be.called();
  });
});
