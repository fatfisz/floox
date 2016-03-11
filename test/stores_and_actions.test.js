'use strict';

const should = require('should');

const createFloox = require('../dist').createFloox;


function shouldBeAStore(store) {
  store.should.have.properties([
    'emit',
    'on',
    'off',
  ]);

  should(store.emit).be.a.Function();
  should(store.on).be.a.Function();
  should(store.off).be.a.Function();
}

function shouldNotBeCalled() {
  throw new Error('This function shouln\'t be called');
}

describe('Stores', () => {
  let floox;
  let myStore;
  let myActionCallback;
  let internalCallback;

  before(() => {
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

    floox = createFloox(myStore);
  });

  describe('creating stores and actions', () => {
    it('should create a store and set up the right properties', () => {
      const addedStore = floox.store;

      should(addedStore).be.equal(myStore);

      shouldBeAStore(addedStore);

      floox.actions.should.have.property('myAction');
      floox.actions.should.have.property('internal');
    });

    it('should create a new action and handle it properly', (done) => {
      const testData = { some: 'other Object' };

      function test(data) {
        should(data).eql({ some: 'other Object' });
        done();
      }

      myActionCallback = test;

      function action(dispatcherActions, data) {
        dispatcherActions.myAction(data);
      }

      const createActionResult = floox.createAction('the.action', action);

      should(createActionResult).be.equal(action);

      floox.actions['the.action'](testData);
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

    it('shouldn\'t allow creating two actions with the same name', () => {
      floox.createAction('duplicateActionBefore', shouldNotBeCalled);

      should(() => {
        floox.createAction('duplicateActionBefore', shouldNotBeCalled);
      }).throw('Action "duplicateActionBefore" is already registered');
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
        }).throw('Unknown event "noSuchEvent"');
      });
    });
  });

  describe('actions', () => {
    it('should handle a dispatched action', (done) => {
      const testData = { some: 'Object' };

      function test(data) {
        should(data).eql({ some: 'Object' });
        done();
      }

      myActionCallback = test;

      floox.actions.myAction(testData);
    });

    it('shouldn\'t allow dispatching in the middle of a dispatch', (done) => {
      function testAction(actionName) {
        should(() => {
          floox.actions[actionName]();
        }).throw(/Cannot dispatch in the middle of a dispatch./);
      }

      function test() {
        testAction('myAction');
        testAction('internal');
        done();
      }

      myActionCallback = test;

      floox.actions.myAction();
    });
  });
});
