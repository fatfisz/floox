'use strict';

const should = require('should');

const createFloox = require('../factory');


function shouldBeAStore(store) {
  store.should.have.properties([
    'emit',
    'on',
    'off',
    'waitFor',
  ]);

  should(store.emit).be.a.Function();
  should(store.on).be.a.Function();
  should(store.off).be.a.Function();
  should(store.waitFor).be.a.Function();
}

function shouldNotBeCalled() {
  throw new Error('This function shouln\'t be called');
}

describe('Stores', () => {
  let floox;
  let myStore;
  let myActionCallback;
  let internalCallback;
  let otherStore;
  let otherMyActionCallback;
  let namespacedMyActionCallback;

  before(() => {
    floox = createFloox();

    myStore = {
      handlers: {
        myAction(data) {
          myActionCallback.call(this, data);
        },
        internal(data) {
          internalCallback.call(this, data);
        },
      },
    };

    otherStore = {
      events: ['mychange'],

      handlers: {
        myAction(data) {
          otherMyActionCallback.call(this, data);
        },
        myNamespace: {
          myAction(data) {
            namespacedMyActionCallback.call(this, data);
          },
        },
      },
    };
  });

  describe('creating stores and actions', () => {
    it('should create a store and set up the right properties', () => {
      const createStoreResult = floox.createStore('myStore', myStore);

      const addedStore = floox.stores.myStore;

      should(createStoreResult).be.equal(myStore);
      should(addedStore).be.equal(myStore);

      shouldBeAStore(addedStore);

      floox.actions.should.have.property('myAction');
      floox.actions.should.have.property('internal');
    });

    it('should create another store properly', () => {
      floox.createStore('otherStore', otherStore);

      const addedStore = floox.stores.otherStore;

      addedStore.should.be.equal(otherStore);

      shouldBeAStore(addedStore);

      floox.actions.should.have.property('myAction');
      floox.actions.should.have.property('internal');
      floox.actions.should.have.property('myNamespace');
      floox.actions.myNamespace.should.have.property('myAction');

      should(floox.actions.myAction).be.a.Function();
      should(floox.actions.internal).be.a.Function();
      should(floox.actions.myNamespace).be.an.Object();
      should(floox.actions.myNamespace.myAction).be.a.Function();
    });

    it('should create a new action and handle it properly', (done) => {
      const testData = { some: 'other Object' };
      let leftToHandle = 2;

      function test(data) {
        should(data).eql({ some: 'other Object' });

        leftToHandle -= 1;
        if (leftToHandle === 0) {
          done();
        }
      }

      myActionCallback = test;
      otherMyActionCallback = test;
      namespacedMyActionCallback = shouldNotBeCalled;

      function action(dispatcherActions, data) {
        dispatcherActions.myAction(data);
      }

      const createActionResult = floox.createAction('the.action', action);

      should(createActionResult).be.equal(action);

      floox.actions.the.action(testData);
    });

    it('should allow overriding an action in the interface without changing the internals', (done) => {
      const testData = { some: 'one more Object' };
      let externalWasCalled = false;

      internalCallback = function (data) {
        externalWasCalled.should.be.true();
        should(data).eql({ some: 'one more Object' });
        done();
      };

      floox.createAction('internal', (dispatcherActions, data) => {
        externalWasCalled = true;
        dispatcherActions.internal(data);
      });

      floox.actions.internal(testData);
    });

    it('shouldn\'t allow creating two stores with the same name', () => {
      should(() => {
        floox.createStore('myStore');
      }).throw('Store "myStore" is already registered');
    });

    it('shouldn\'t overwrite an action creator with an action dispatcher created with a store', () => {
      floox.createAction('doNotOverwrite', () => {});

      const theRightHandler = floox.actions.doNotOverwrite;

      floox.createStore('OverwritingStore', {
        handlers: {
          doNotOverwrite() {},
        },
      });

      floox.actions.doNotOverwrite.should.be.equal(theRightHandler);
    });

    it('shouldn\'t allow creating two actions with the same name (before store creation)', () => {
      floox.createAction('duplicateActionBefore', shouldNotBeCalled);

      should(() => {
        floox.createAction('duplicateActionBefore', shouldNotBeCalled);
      }).throw('Action "duplicateActionBefore" is already registered');
    });

    it('shouldn\'t allow creating two actions with the same name (store creation in between)', () => {
      floox.createAction('duplicateActionBetween', shouldNotBeCalled);

      floox.createStore('duplicateActionStoreBetween', {
        handlers: {
          duplicateActionBetween() {},
        },
      });

      should(() => {
        floox.createAction('duplicateActionBetween', shouldNotBeCalled);
      }).throw('Action "duplicateActionBetween" is already registered');
    });

    it('shouldn\'t allow creating two actions with the same name (after store creation)', () => {
      floox.createStore('duplicateActionStoreAfter', {
        handlers: {
          duplicateActionAfter() {},
        },
      });

      floox.createAction('duplicateActionAfter', shouldNotBeCalled);

      should(() => {
        floox.createAction('duplicateActionAfter', shouldNotBeCalled);
      }).throw('Action "duplicateActionAfter" is already registered');
    });

    it('should throw if there are two handlers with the same name', () => {
      should(() => {
        floox.createStore('error', {
          handlers: {
            namespaced: { handler() {} },
            'namespaced.handler'() {},
          },

        });
      }).throw('Store "error" has duplicate action handlers "namespaced.handler"');
    });

    it('should throw if a handler is named the same as an exisiting namespace', () => {
      should(() => {
        floox.createStore('error', {
          handlers: {
            very: { namespaced: { handler() {} } },
            'very.namespaced'() {},
          },
        });
      }).throw('Can\'t name a handler the same as an existing namespace "very.namespaced"');
    });

    it('should throw if a namespace fragment is a name of an existing handler', () => {
      should(() => {
        floox.createStore('error', {
          handlers: {
            'quite.namespaced'() {},
            quite: { namespaced: { handler() {} } },
          },
        });
      }).throw('"quite.namespaced" is already a non-namespace');
    });

  });

  describe('events', () => {

    it('should handle the default "change" event', (done) => {
      myStore.on('change', () => {
        done();
      });

      myStore.emit('change');
    });

    it('should throw if an event was not declared', () => {
      const eventMethods = [
        'emit',
        'on',
        'off',
      ];

      eventMethods.forEach((eventMethod) => {
        should(() => {
          myStore[eventMethod]('noSuchEvent');
        }).throw('Store "myStore" does not handle the event "noSuchEvent"');
      });
    });

    it('should throw if "events" property has an invalid format', () => {
      const testedValues = [
        0,
        [],
        'meh',
      ];

      testedValues.forEach((value) => {
        should(() => {
          floox.createStore('error', {
            events: value,
          });
        }).throw('The "events" property in store "error" should be a non-empty array');
      });
    });

    it('shouldn\'t handle "change" event if it isn\'t defined in "events"', () => {
      should(() => {
        otherStore.emit('change');
      }).throw('Store "otherStore" does not handle the event "change"');
    });

    it('should handle non-default event declared in "events"', () => {
      should.doesNotThrow(() => {
        otherStore.emit('mychange');
      });
    });

  });

  describe('actions', () => {
    it('should handle a dispatched action', (done) => {
      const testData = { some: 'Object' };
      let leftToHandle = 2;

      function test(data) {
        should(data).eql({ some: 'Object' });

        leftToHandle -= 1;
        if (leftToHandle === 0) {
          done();
        }
      }

      myActionCallback = test;
      otherMyActionCallback = test;
      namespacedMyActionCallback = shouldNotBeCalled;

      floox.actions.myAction(testData);
    });

    it('should handle a dispatched namespaced action', (done) => {
      const testData = { some: 'Object' };

      namespacedMyActionCallback = function test(data) {
        should(data).eql({ some: 'Object' });
        done();
      };

      myActionCallback = shouldNotBeCalled;
      otherMyActionCallback = shouldNotBeCalled;

      floox.actions.myNamespace.myAction(testData);
    });

    it('shouldn\'t allow dispatching in the middle of a dispatch', (done) => {
      let leftToHandle = 2;

      function testAction(actionName) {
        should(() => {
          floox.actions[actionName]();
        }).throw(/Cannot dispatch in the middle of a dispatch./);
      }

      function test() {
        testAction('myAction');
        testAction('internal');

        leftToHandle -= 1;
        if (leftToHandle === 0) {
          done();
        }
      }

      myActionCallback = test;
      otherMyActionCallback = test;
      namespacedMyActionCallback = shouldNotBeCalled;

      floox.actions.myAction();
    });
  });

  describe('waitFor', () => {
    it('myStore should wait for otherStore', (done) => {
      const testData = 'test string';
      let wasOtherStoreCalled = false;

      myActionCallback = function (data) {
        this.waitFor(['otherStore']);

        wasOtherStoreCalled.should.be.true();
        should(data).be.equal('test string');

        done();
      };

      otherMyActionCallback = function (data) {
        wasOtherStoreCalled = true;

        should(data).be.equal('test string');
      };

      floox.actions.myAction(testData);
    });

    it('otherStore should wait for myStore', (done) => {
      const testData = 'test string';
      let wasMyStoreCalled = false;

      myActionCallback = function (data) {
        wasMyStoreCalled = true;

        should(data).be.equal('test string');
      };

      otherMyActionCallback = function (data) {
        this.waitFor(['myStore']);

        wasMyStoreCalled.should.be.true();
        should(data).be.equal('test string');

        done();
      };

      floox.actions.myAction(testData);
    });

    it('should detect a circular dependency and throw', (done) => {
      let wasMyStoreCalled = false;
      let wasOtherStoreCalled = false;

      myActionCallback = function () {
        if (wasOtherStoreCalled) {
          should(() => {
            this.waitFor(['otherStore']);
          }).throw(/Circular dependency detected/);
          done();
        } else {
          wasMyStoreCalled = true;
          this.waitFor(['otherStore']);
        }
      };

      otherMyActionCallback = function () {
        if (wasMyStoreCalled) {
          should(() => {
            this.waitFor(['myStore']);
          }).throw(/Circular dependency detected/);
          done();
        } else {
          wasOtherStoreCalled = true;
          this.waitFor(['myStore']);
        }
      };

      namespacedMyActionCallback = shouldNotBeCalled;

      floox.actions.myAction();
    });
  });
});
