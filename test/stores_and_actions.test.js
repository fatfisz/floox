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

describe('Stores', function () {
  var floox;
  var myStore;
  var myActionCallback;
  var internalCallback;
  var otherStore;
  var otherMyActionCallback;
  var namespacedMyActionCallback;

  before(function () {
    floox = createFloox();

    myStore = {

      handlers: {

        myAction: function (data) {
          myActionCallback.call(this, data);
        },

        internal: function (data) {
          internalCallback.call(this, data);
        },

      },

    };

    otherStore = {

      events: ['mychange'],

      handlers: {

        myAction: function (data) {
          otherMyActionCallback.call(this, data);
        },

        myNamespace: {

          myAction: function (data) {
            namespacedMyActionCallback.call(this, data);
          },

        },

      },

    };
  });

  describe('creating stores and actions', function () {

    it('should create a store and set up the right properties', function () {
      var createStoreResult = floox.createStore('myStore', myStore);

      var addedStore = floox.stores.myStore;

      should(createStoreResult).be.equal(myStore);
      should(addedStore).be.equal(myStore);

      shouldBeAStore(addedStore);

      floox.actions.should.have.property('myAction');
      floox.actions.should.have.property('internal');
    });

    it('should create another store properly', function () {
      floox.createStore('otherStore', otherStore);

      var addedStore = floox.stores.otherStore;

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

    it('should create a new action and handle it properly', function (done) {
      var testData = { some: 'other Object' };
      var leftToHandle = 2;

      function test(data) {
        should.deepEqual(data, { some: 'other Object' });

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

      var createActionResult = floox.createAction('the.action', action);

      should(createActionResult).be.equal(action);

      floox.actions.the.action(testData);
    });

    it('should allow overriding an action in the interface without changing the internals', function (done) {
      var testData = { some: 'one more Object' };
      var externalWasCalled = false;

      internalCallback = function (data) {
        externalWasCalled.should.be.true();
        should.deepEqual(data, { some: 'one more Object' });
        done();
      };

      floox.createAction('internal', function (dispatcherActions, data) {
        externalWasCalled = true;
        dispatcherActions.internal(data);
      });

      floox.actions.internal(testData);
    });

    it('shouldn\'t allow creating two stores with the same name', function () {
      should.throws(function () {
        floox.createStore('myStore');
      }, function (err) {
        should(err.message).be.equal('Store "myStore" is already registered');
        return true;
      });
    });

    it('shouldn\'t overwrite an action creator with an action dispatcher created with a store', function () {
      floox.createAction('doNotOverwrite', function () {});

      var theRightHandler = floox.actions.doNotOverwrite;

      floox.createStore('OverwritingStore', {
        handlers: {
          doNotOverwrite: function () {},
        },
      });

      floox.actions.doNotOverwrite.should.be.equal(theRightHandler);
    });

    it('should throw if there are two handlers with the same name', function () {
      should.throws(function () {
        floox.createStore('error', {

          handlers: {

            namespaced: { handler: function () {} },

            'namespaced.handler': function () {},

          },

        });
      }, function (err) {
        should(err.message).be.equal(
          'Store "error" has duplicate action handlers "namespaced.handler"'
        );
        return true;
      });
    });

    it('should throw if a handler is named the same as an exisiting namespace', function () {
      should.throws(function () {
        floox.createStore('error', {

          handlers: {

            very: { namespaced: { handler: function () {} } },

            'very.namespaced': function () {},

          },

        });
      }, function (err) {
        should(err.message).be.equal(
          'Can\'t name a handler the same as an existing namespace "very.namespaced"'
        );
        return true;
      });
    });

    it('should throw if a namespace fragment is a name of an existing handler', function () {
      should.throws(function () {
        floox.createStore('error', {

          handlers: {

            'quite.namespaced': function () {},

            quite: { namespaced: { handler: function () {} } },

          },

        });
      }, function (err) {
        should(err.message).be.equal(
          '"quite.namespaced" is already a non-namespace'
        );
        return true;
      });
    });

  });

  describe('events', function () {

    it('should handle the default "change" event', function (done) {
      myStore.on('change', function () {
        done();
      });

      myStore.emit('change');
    });

    it('should throw if an event was not declared', function () {
      var eventMethods = [
        'emit',
        'on',
        'off',
      ];

      eventMethods.forEach(function (eventMethod) {
        should.throws(function () {
          myStore[eventMethod]('noSuchEvent');
        }, function (err) {
          should(err.message).be.equal(
            'Store "myStore" does not handle the event "noSuchEvent"'
          );
          return true;
        });
      });
    });

    it('should throw if "events" property has an invalid format', function () {
      var testedValues = [
        0,
        [],
        'meh',
      ];

      testedValues.forEach(function (value) {
        should.throws(function () {
          floox.createStore('error', {
            events: value,
          });
        }, function (err) {
          should(err.message).be.equal(
            'The "events" property in store "error" should be a non-empty array'
          );
          return true;
        });
      });
    });

    it('shouldn\'t handle "change" event if it isn\'t defined in "events"', function () {
      should.throws(function () {
        otherStore.emit('change');
      }, function (err) {
        should(err.message).be.equal(
          'Store "otherStore" does not handle the event "change"'
        );
        return true;
      });
    });

    it('should handle non-default event declared in "events"', function () {
      should.doesNotThrow(function () {
        otherStore.emit('mychange');
      });
    });

  });

  describe('actions', function () {

    it('should handle a dispatched action', function (done) {
      var testData = { some: 'Object' };
      var leftToHandle = 2;

      function test(data) {
        should.deepEqual(data, { some: 'Object' });

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

    it('should handle a dispatched namespaced action', function (done) {
      var testData = { some: 'Object' };

      namespacedMyActionCallback = function test(data) {
        should.deepEqual(data, { some: 'Object' });
        done();
      };

      myActionCallback = shouldNotBeCalled;
      otherMyActionCallback = shouldNotBeCalled;

      floox.actions.myNamespace.myAction(testData);
    });

    it('shouldn\'t allow dispatching in the middle of a dispatch', function (done) {
      var leftToHandle = 2;

      function testAction(actionName) {
        should.throws(function () {
          floox.actions[actionName]();
        }, function (err) {
          should(err.message).containEql('Cannot dispatch in the middle of a dispatch.');
          return true;
        });
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

  describe('waitFor', function () {

    it('myStore should wait for otherStore', function (done) {
      var testData = 'test string';
      var wasOtherStoreCalled = false;

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

    it('otherStore should wait for myStore', function (done) {
      var testData = 'test string';
      var wasMyStoreCalled = false;

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

    it('should detect a circular dependency and throw', function (done) {
      var wasMyStoreCalled = false;
      var wasOtherStoreCalled = false;

      myActionCallback = function () {
        if (wasOtherStoreCalled) {
          should.throws(function () {
            this.waitFor(['otherStore']);
          }.bind(this), function (err) {
            should(err.message).containEql('Circular dependency detected');
            return true;
          });
          done();
        } else {
          wasMyStoreCalled = true;
          this.waitFor(['otherStore']);
        }
      };

      otherMyActionCallback = function () {
        if (wasMyStoreCalled) {
          should.throws(function () {
            this.waitFor(['myStore']);
          }.bind(this), function (err) {
            should(err.message).containEql('Circular dependency detected');
            return true;
          });
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
