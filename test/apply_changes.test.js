'use strict';

const mockery = require('mockery');
const should = require('should/as-function');
const sinon = require('sinon');


describe('applyChanges function', () => {
  let cleanup;
  let listenersCallback;
  let applyChanges;

  beforeEach(() => {
    cleanup = sinon.spy();
    listenersCallback = sinon.spy();

    mockery.registerMock('./cleanup', cleanup);
    mockery.registerMock('./listeners_callback', listenersCallback);

    applyChanges = require('../tmp/apply_changes');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should export a function that accepts one argument', () => {
    should(applyChanges).be.a.Function();
    should(applyChanges).have.a.length(1);
  });

  it('should set data to appropriate values', () => {
    const listeners = new Set();
    const data = {
      state: 'state',
      listeners,
      listenersLeft: 'not changed',
      isSetting: false,
      partialStates: [],
    };

    applyChanges(data);

    should(data).be.eql({
      state: 'state',
      listeners,
      listenersLeft: 'not changed',
      isSetting: true,
      partialStates: [],
    });
  });

  it('should set the number of listeners if there are any', () => {
    const listeners = new Set([() => {}, () => {}, () => {}]);
    const data = {
      state: 'state',
      listeners,
      listenersLeft: 0,
      isSetting: false,
      partialStates: [],
    };

    applyChanges(data);

    should(data).be.eql({
      state: 'state',
      listeners,
      // There is an additional internal listener, so the number is 3 + 1
      listenersLeft: 4,
      isSetting: true,
      partialStates: [],
    });
  });

  it('should call `combineState` with appropriate arguments', () => {
    const combineState = sinon.stub();
    combineState
      .onFirstCall().returns('first')
      .onSecondCall().returns('second')
      .onThirdCall().returns('third');
    const data = {
      state: 'start',
      listeners: new Set(),
      combineState,
      partialStates: ['first state', 'second state', 'third state'],
    };

    applyChanges(data);

    should(combineState).be.calledThrice();
    should(combineState).be.calledWithExactly('start', 'first state');
    should(combineState).be.calledWithExactly('first', 'second state');
    should(combineState).be.calledWithExactly('second', 'third state');
    should(data.state).be.equal('third');
  });

  it('should call `cleanup` if there are no listeners', () => {
    const data = {
      listeners: new Set(),
      partialStates: [],
    };

    applyChanges(data);

    should(cleanup).be.calledOnce();
    should(cleanup).be.calledWithExactly(data);
  });

  it('shouldn\'t call `cleanup` if there are listeners', () => {
    const data = {
      listeners: new Set([() => {}]),
      partialStates: [],
    };

    applyChanges(data);

    should(cleanup).not.be.called();
  });

  it('should call listeners with `listenersCallback` in the callback', () => {
    function listener1(callback) {
      should(callback).be.a.Function();
      should(listenersCallback).not.be.called();
      callback();
      should(listenersCallback).be.calledOnce();
    }

    function listener2(callback) {
      should(callback).be.a.Function();
      should(listenersCallback).be.calledOnce();
      callback();
      should(listenersCallback).be.calledTwice();
    }

    function listener3(callback) {
      should(callback).be.a.Function();
      should(listenersCallback).be.calledTwice();
      callback();
      should(listenersCallback).be.calledThrice();
    }

    const data = {
      listeners: new Set([listener1, listener2, listener3]),
      partialStates: [],
    };

    applyChanges(data);

    should(listenersCallback).be.alwaysCalledWithExactly(data);
  });

  describe('modifying listeners from listeners', () => {
    beforeEach(() => {
      mockery.deregisterMock('./listeners_callback');
      mockery.resetCache();

      applyChanges = require('../tmp/apply_changes');
    });

    it('should handle the case of a listener that\'s adding a new listener', () => {
      function listener1(callback) {
        should(cleanup).not.be.called();
        data.listeners.add(listener3);
        callback();
      }

      function listener2(callback) {
        should(cleanup).not.be.called();
        callback();
      }

      function listener3(callback) {
        should(cleanup).not.be.called();
        callback();
      }

      const data = {
        listeners: new Set([listener1, listener2]),
        partialStates: [],
      };

      applyChanges(data);
      should(cleanup).be.calledOnce();
    });

    it('should handle the case of a listener that\'s removing a listener', () => {
      function listener1(callback) {
        should(cleanup).not.be.called();
        data.listeners.delete(listener3);
        callback();
      }

      function listener2(callback) {
        should(cleanup).not.be.called();
        callback();
      }

      function listener3(callback) {
        should(cleanup).not.be.called();
        callback();
      }

      const data = {
        listeners: new Set([listener1, listener2, listener3]),
        partialStates: [],
      };

      applyChanges(data);
      should(cleanup).be.calledOnce();
    });
  });
});
