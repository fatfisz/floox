'use strict';

const should = require('should/as-function');
const sinon = require('sinon');

const defaultCombineState = require('../dist/default_combine_state');
const Floox = require('../dist/floox_class');


describe('Floox (class)', () => {
  it('should export a function that accepts one argument', () => {
    should(Floox).be.a.Function();
    should(Floox).have.a.length(1);
  });

  describe('instantiating', () => {
    beforeEach(() => {
      sinon.spy(WeakMap.prototype, 'set');
    });

    afterEach(() => {
      WeakMap.prototype.set.restore();
    });

    it('should throw when not instantiated using `new`', () => {
      should(() => {
        Floox({});
      }).throw(TypeError, {
        message: 'Cannot call a class as a function',
      });
    });

    it('should throw when the `config` argument is missing', () => {
      should(() => {
        // eslint-disable-next-line no-new
        new Floox();
      }).throw('The "config" argument is missing.');
    });

    it('should throw when the `getInitialState` method is missing', () => {
      should(() => {
        // eslint-disable-next-line no-new
        new Floox({});
      }).throw('The config is missing the "getInitialState" method.');
    });

    it('should use the default `combineState` method if it is missing from the config', () => {
      // eslint-disable-next-line no-new
      new Floox({
        getInitialState() {},
      });

      should(WeakMap.prototype.set).be.calledOnce();
      should(WeakMap.prototype.set.args[0][1]).have.properties({
        combineState: defaultCombineState,
      });
    });

    it('should use the default `combineState` method if it is present in the config', () => {
      const combineState = () => {};

      // eslint-disable-next-line no-new
      new Floox({
        getInitialState() {},
        combineState,
      });

      should(WeakMap.prototype.set).be.calledOnce();
      should(WeakMap.prototype.set.args[0][1]).have.properties({
        combineState,
      });
    });

    it('should properly set up the private properties', () => {
      const getInitialState = sinon.stub().returns('initial state');
      // eslint-disable-next-line no-new
      new Floox({
        getInitialState,
      });

      should(getInitialState).be.calledOnce();
      should(getInitialState).be.calledWithExactly();
      should(WeakMap.prototype.set).be.calledOnce();

      const data = WeakMap.prototype.set.args[0][1];
      should(data).have.properties({
        state: 'initial state',
        isSetting: false,
        listenersLeft: 0,
        currentCallback: null,
      });

      should(data.listeners).be.instanceOf(Set);
      should(data.listenersCallback).be.a.Function();
    });

    it('should assign the properties of the config object to the instance', () => {
      const combineState = () => {};
      const testMethod = () => {};

      // eslint-disable-next-line no-new
      const instance = new Floox({
        getInitialState() {},
        combineState,
        testMethod,
        testString: 'test',
      });

      should(instance).have.properties({
        testMethod,
        testString: 'test',
      });

      should(instance).not.have.properties('getInitialState', 'combineState');
    });
  });

  describe('methods and properties', () => {
    let data;
    let instance;

    beforeEach(() => {
      data = {};
      sinon.stub(WeakMap.prototype, 'get').returns(data);

      instance = new Floox({
        getInitialState() {
          return {};
        },
      });
    });

    afterEach(() => {
      WeakMap.prototype.get.restore();
    });

    it('should be able to retrieve the state', () => {
      data.state = 'current state';

      const state = instance.state;

      should(state).be.equal('current state');
    });

    it('should throw if trying to use `setState` when the `isSetting` flag is on', () => {
      data.isSetting = true;

      should(() => {
        instance.setState();
      }).throw('Cannot change Floox state in the middle of state propagation.');
    });

    it('should call the callback passed to `setState` and set the private data properly', () => {
      const partial = {};
      const callback = sinon.spy();
      const combineState = sinon.stub().returns('combination result');
      const state = {};
      const listenersCallback = 'listeners callback';
      // Those listeners do nothing, and so the listener count should be left
      // intact and the `isSetting` flag should be on.
      const listener = sinon.spy();
      const listener2 = sinon.spy();
      const listener3 = sinon.spy();

      data.state = state;
      data.combineState = combineState;
      data.listeners = new Set([listener, listener2, listener3]);
      data.listenersCallback = listenersCallback;

      instance.setState(partial, callback);

      should(combineState).be.calledOnce();
      should(combineState).be.calledWithExactly(state, partial);

      should(data).have.properties({
        state: 'combination result',
        isSetting: true,
        listenersLeft: 3,
        currentCallback: callback,
      });

      should(listener).be.calledOnce();
      should(listener).be.calledWithExactly(listenersCallback);
      should(listener2).be.calledOnce();
      should(listener2).be.calledWithExactly(listenersCallback);
      should(listener3).be.calledOnce();
      should(listener3).be.calledWithExactly(listenersCallback);
    });

    it('should allow adding listeners', () => {
      data.listeners = new Set();

      should(data.listeners).have.property('size', 0);

      instance.addChangeListener('listener');

      should(data.listeners).have.property('size', 1);
      should(data.listeners.has('listener')).be.true();
    });

    it('should not allow adding listeners when the `isSetting` flag is on', () => {
      data.combineState = () => {};
      data.listeners = new Set([() => {}]);

      should(data.listeners).have.property('size', 1);

      instance.setState();

      should(() => {
        instance.addChangeListener('listener');
      }).throw('Cannot add listeners in the middle of state propagation.');

      should(data.listeners).have.property('size', 1);
    });

    it('should allow removing listeners', () => {
      data.listeners = new Set(['listener']);

      should(data.listeners).have.property('size', 1);
      should(data.listeners.has('listener')).be.true();

      instance.removeChangeListener('listener');

      should(data.listeners).have.property('size', 0);
    });

    it('should not allow remove listeners when the `isSetting` flag is on', () => {
      data.combineState = () => {};
      data.listeners = new Set([() => {}]);

      should(data.listeners).have.property('size', 1);

      instance.setState();

      should(() => {
        instance.removeChangeListener('listener');
      }).throw('Cannot remove listeners in the middle of state propagation.');

      should(data.listeners).have.property('size', 1);
    });
  });

  describe('setting state', () => {
    let instance;

    beforeEach(() => {
      instance = new Floox({
        getInitialState() {
          return {};
        },
      });
    });

    it('should not allow setting the state until the previous setting ends', () => {
      const callback = sinon.spy();

      instance.addChangeListener(() => {});
      instance.addChangeListener(() => {});
      instance.addChangeListener(() => {});
      instance.setState(null, callback);

      should(callback).not.be.called();
      should(() => {
        instance.setState(null, callback);
      }).throw('Cannot change Floox state in the middle of state propagation.');
    });

    it('should allow setting the state again immediately if there are no listeners', () => {
      const callback = sinon.spy();

      instance.setState(null, callback);

      should(callback).be.calledOnce();
      should(() => {
        instance.setState(null, callback);
      }).not.throw();
    });

    it('should allow setting the state if the previous setting has finished (sync)', () => {
      const callback = sinon.spy();

      instance.addChangeListener((callback) => {
        callback();
      });
      instance.addChangeListener((callback) => {
        callback();
      });
      instance.addChangeListener((callback) => {
        callback();
      });
      instance.setState(null, callback);

      should(callback).be.calledOnce();
      should(() => {
        instance.setState(null, callback);
      }).not.throw();
    });

    it('should allow setting the state if the previous setting has finished (async)', (done) => {
      const callback = sinon.spy(() => {
        should(() => {
          instance.setState(null);
        }).not.throw();

        // Done will be called only once iff the callback is called once.
        done();
      });

      instance.addChangeListener((callback) => {
        setTimeout(callback);
      });
      instance.addChangeListener((callback) => {
        setTimeout(callback);
      });
      instance.addChangeListener((callback) => {
        setTimeout(callback);
      });
      instance.setState(null, callback);
    });
  });
});
