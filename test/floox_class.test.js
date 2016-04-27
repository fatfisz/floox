'use strict';

const mockery = require('mockery');
const should = require('should/as-function');
const sinon = require('sinon');


describe('Floox class', () => {
  let applyChanges;
  let defaultCombineState;
  let Floox;

  beforeEach(() => {
    applyChanges = sinon.spy();
    defaultCombineState = 'default combine state';

    mockery.registerMock('./apply_changes', applyChanges);
    mockery.registerMock('./default_combine_state', defaultCombineState);

    Floox = require('../tmp/floox_class');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

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
      should(data).have.keys(
        'state',
        'combineState',
        'listeners',
        'listenersLeft',
        'batchCount',
        'isSetting',
        'partialStates',
        'callbacks'
      );
      should(data).have.properties({
        state: 'initial state',
        listenersLeft: 0,
        batchCount: 0,
        isSetting: false,
        partialStates: [],
        callbacks: [],
      });

      should(data.listeners).be.instanceOf(Set);
      should(data.listeners.size).be.equal(0);
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

    describe('setState', () => {
      it('should throw if calling when the `isSetting` flag is on', () => {
        data.isSetting = true;

        should(() => {
          instance.setState();
        }).throw('Cannot change Floox state in the middle of state propagation.');
      });

      it('should add `undefined` to the state queue if the partial state is missing', () => {
        data.partialStates = [];
        instance.setState();

        // eslint-disable-next-line no-undefined
        should(data.partialStates).be.eql([undefined]);
      });

      it('should add the partial state to the state queue', () => {
        data.partialStates = [];
        instance.setState('partial state');

        should(data.partialStates).be.eql(['partial state']);
      });

      it('should not add the callback to the callback queue if it\'s missing', () => {
        data.partialStates = [];
        data.callbacks = [];
        instance.setState(null);

        should(data.callbacks).be.eql([]);
      });

      it('should add the callback to the callback queue if it\'s present', () => {
        data.partialStates = [];
        data.callbacks = [];
        instance.setState(null, 'callback');

        should(data.callbacks).be.eql(['callback']);
      });

      it('should not call `applyChanges` if the batch count is not 0', () => {
        data.batchCount = 1;
        data.partialStates = [];
        instance.setState();

        should(applyChanges).not.be.called();
      });

      it('should call `applyChanges` with the private data if the batch count is 0', () => {
        data.batchCount = 0;
        data.partialStates = [];
        instance.setState();

        should(applyChanges).be.calledOnce();
        should(applyChanges).be.calledWithExactly(data);
      });
    });

    describe('batch', () => {
      it('should throw if calling with a non-function as a first argument', () => {
        should(() => {
          instance.batch();
        }).throw('Expected the first argument to be a function.');
      });

      it('should throw if calling when the `isSetting` flag is on', () => {
        data.isSetting = true;

        should(() => {
          instance.batch(() => {});
        }).throw('Cannot change Floox state in the middle of state propagation.');
      });

      it('should update the batch count and call the first argument in between', () => {
        function changes() {
          should(data.batchCount).be.equal(1);
        }

        data.batchCount = 0;

        instance.batch(changes);
        should(data.batchCount).be.equal(0);
      });

      it('should not add the callback to the callback queue if it\'s missing', () => {
        data.callbacks = [];
        instance.batch(() => {});

        should(data.callbacks).be.eql([]);
      });

      it('should add the callback to the callback queue if it\'s present', () => {
        data.callbacks = [];
        instance.batch(() => {}, 'callback');

        should(data.callbacks).be.eql(['callback']);
      });

      it('should not call `applyChanges` if the batch count is not 0', () => {
        data.batchCount = 1;
        instance.batch(() => {});

        should(applyChanges).not.be.called();
      });

      it('should call `applyChanges` with the private data if the batch count is 0', () => {
        data.batchCount = 0;
        instance.batch(() => {});

        should(applyChanges).be.calledOnce();
        should(applyChanges).be.calledWithExactly(data);
      });
    });

    it('should allow adding listeners', () => {
      data.listeners = new Set();

      should(data.listeners).have.property('size', 0);

      instance.addChangeListener('listener');

      should(data.listeners).have.property('size', 1);
      should(data.listeners.has('listener')).be.true();
    });

    it('should allow removing listeners', () => {
      data.listeners = new Set(['listener']);

      should(data.listeners).have.property('size', 1);
      should(data.listeners.has('listener')).be.true();

      instance.removeChangeListener('listener');

      should(data.listeners).have.property('size', 0);
    });
  });
});
