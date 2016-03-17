/*
 * floox
 * https://github.com/fatfisz/floox
 *
 * Copyright (c) 2015 FatFisz
 * Licensed under the MIT license.
 */

'use strict';

// Import jsdom and configure globals before loading React
var jsdom = require('jsdom');

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = global.document.defaultView;
global.navigator = global.window.navigator;

var React = require('react/addons');
var should = require('should');

var createFloox = require('../factory');


describe('Mixin', function () {
  var floox;
  var StateFromStoreMixin;
  var MyComponent;
  var renderedComponent;

  function shouldHaveCorrectState() {
    should.deepEqual(renderedComponent.state, {
      notImportant: 1,
      stores: {
        myStore: {
          _data: floox.stores.myStore._data,
          _updates: floox.stores.myStore._updates,
          data: floox.stores.myStore.data(),
          updates: floox.stores.myStore.updates(),
        },
        otherStore: {
          data: floox.stores.otherStore.getData(),
        },
        namespaced: {
          store: {
            data: floox.stores.namespaced.store.getData(),
          },
          otherStore: {
            data: floox.stores.namespaced.store.getData(),
          },
        },
      },
    });
  }

  before(function () {
    floox = createFloox();

    StateFromStoreMixin = floox.StateFromStoreMixin;

    floox.createStore('myStore', {

      _data: 1,
      _updates: 0,

      data: function () {
        return this._data;
      },

      updates: function () {
        return this._updates;
      },

      handlers: {

        myAction: function () {
          this._data *= 2;
          this._updates += 1;
          this.emit('change');
        },

      },

    });

    floox.createStore('otherStore', {

      _data: 'a',

      getData: function () {
        return this._data;
      },

      handlers: {

        myAction: function () {
          this._data += 'a';
          this.emit('change');
        },

      },

    });

    floox.createStore('namespaced.store', {

      _data: 'const',

      getData: function () {
        return this._data;
      },

    });

    floox.createStore('namespaced.otherStore', {

      _data: 'const',

      getData: function () {
        return this._data;
      },

    });

    MyComponent = React.createClass({

      mixins: [StateFromStoreMixin],

      getInitialState: function () {
        return {
          notImportant: 1,
        };
      },

      getStoreStateMapping: function () {
        return {
          myStore: [
            '_data',
            '_updates',
            'data',
            'updates',
          ],
          otherStore: {
            data: 'getData',
          },
          'namespaced.store': {
            data: 'getData',
          },
          namespaced: {
            otherStore: {
              data: 'getData',
            },
          },
        };
      },

      render: function () {
        return React.DOM.div();
      },

    });
  });

  it('mixin should have all the right properties', function () {
    should(StateFromStoreMixin).be.an.Object();

    StateFromStoreMixin.should.have.properties([
      'getInitialState',
      'componentDidMount',
      'componentWillUnmount',
    ]);

    should(StateFromStoreMixin.getInitialState).be.a.Function();
    should(StateFromStoreMixin.componentDidMount).be.a.Function();
    should(StateFromStoreMixin.componentWillUnmount).be.a.Function();
  });

  it('should throw if component doesn\'t have a "getStoreStateMapping" method', function () {
    var ComponentWithoutRequiredMethod = React.createClass({

      displayName: 'ComponentWithoutRequiredMethod',

      mixins: [StateFromStoreMixin],

      render: function () {
        return null;
      },

    });

    var element = React.createElement(ComponentWithoutRequiredMethod);

    should.throws(function () {
      React.addons.TestUtils.renderIntoDocument(element);
    }, function (err) {
      should(err.message).be.eql(
        'Component "ComponentWithoutRequiredMethod" should have a ' +
        '"getStoreStateMapping" method'
      );
      return true;
    });
  });

  it('should warn about bad property values (root-level)', function () {
    function testValue(value, isNamespaced) {
      var storeName = isNamespaced ? 'namespaced.store' : 'store';

      var ComponentWithBadConfig = React.createClass({

        displayName: 'ComponentWithBadConfig',

        mixins: [StateFromStoreMixin],

        getStoreStateMapping: function () {
          var mapping = {};

          mapping[storeName] = value;
          return mapping;
        },

        render: function () {
          return null;
        },

      });

      var element = React.createElement(ComponentWithBadConfig);

      should.throws(function () {
        React.addons.TestUtils.renderIntoDocument(element);
      }, function (err) {
        should(err.message).be.eql(
          '[ComponentWithBadConfig] Expected "' + storeName +
          '" property to be an array or an object'
        );
        return true;
      });
    }

    testValue(1);
    testValue(1, true);
    testValue('test');
    testValue('test', true);
  });

  it('should warn about bad property values (unacceptable type)', function () {
    function testValue(value, isNamespaced) {
      var storeName = isNamespaced ? 'namespaced.store' : 'store';

      var ComponentWithBadConfig = React.createClass({

        displayName: 'ComponentWithBadConfig',

        mixins: [StateFromStoreMixin],

        getStoreStateMapping: function () {
          var mapping = {};

          mapping[storeName] = { data: value };
          return mapping;
        },

        render: function () {
          return null;
        },

      });

      var element = React.createElement(ComponentWithBadConfig);

      should.throws(function () {
        React.addons.TestUtils.renderIntoDocument(element);
      }, function (err) {
        should(err.message).be.eql(
          '[ComponentWithBadConfig] Expected "' + storeName +
          '.data" property to be an array, an object, or a string'
        );
        return true;
      });
    }

    testValue(1);
    testValue(1, true);
  });

  it('should warn about non-existing stores', function () {
    var ComponentWithBadConfig = React.createClass({

      displayName: 'ComponentWithBadConfig',

      mixins: [StateFromStoreMixin],

      getStoreStateMapping: function () {
        return {
          badStore: ['data'],
        };
      },

      render: function () {
        return null;
      },

    });

    var element = React.createElement(ComponentWithBadConfig);

    should.throws(function () {
      React.addons.TestUtils.renderIntoDocument(element);
    }, function (err) {
      should(err.message).be.eql(
        '[ComponentWithBadConfig] Store "badStore" doesn\'t exist'
      );
      return true;
    });
  });

  it('should warn about non-existing store properties (array)', function () {
    var ComponentWithBadConfig = React.createClass({

      displayName: 'ComponentWithBadConfig',

      mixins: [StateFromStoreMixin],

      getStoreStateMapping: function () {
        return {
          myStore: ['nonExisting'],
        };
      },

      render: function () {
        return null;
      },

    });

    var element = React.createElement(ComponentWithBadConfig);

    should.throws(function () {
      React.addons.TestUtils.renderIntoDocument(element);
    }, function (err) {
      should(err.message).be.eql(
        '[ComponentWithBadConfig] Store "myStore" doesn\'t have ' +
        '"nonExisting" property'
      );
      return true;
    });
  });

  it('should warn about non-existing store properties (object)', function () {
    var ComponentWithBadConfig = React.createClass({

      displayName: 'ComponentWithBadConfig',

      mixins: [StateFromStoreMixin],

      getStoreStateMapping: function () {
        return {
          myStore: {
            data: 'nonExisting',
          },
        };
      },

      render: function () {
        return null;
      },

    });

    var element = React.createElement(ComponentWithBadConfig);

    should.throws(function () {
      React.addons.TestUtils.renderIntoDocument(element);
    }, function (err) {
      should(err.message).be.eql(
        '[ComponentWithBadConfig] Store "myStore" doesn\'t have ' +
        '"nonExisting" property'
      );
      return true;
    });
  });

  it('should have the right initial state', function () {
    var element = React.createElement(MyComponent);

    renderedComponent = React.addons.TestUtils.renderIntoDocument(element);
    shouldHaveCorrectState();
  });

  it('should react to the changes caused by actions', function () {
    floox.actions.myAction();
    shouldHaveCorrectState();
  });

  it('should work with batched updates as well', function () {
    React.addons.batchedUpdates(function () {
      floox.actions.myAction();
    });

    shouldHaveCorrectState();
  });

  it('should detach listeners properly when unmounting', function () {
    var container = React.findDOMNode(renderedComponent);
    var element = React.createElement(MyComponent);

    React.unmountComponentAtNode(container.parentNode);

    renderedComponent = React.addons.TestUtils.renderIntoDocument(element);
    shouldHaveCorrectState();

    floox.actions.myAction();
    shouldHaveCorrectState();
  });

  it('should handle the "storeStateWillUpdate" method', function () {
    var oldData = floox.stores.myStore.data();

    var MyComponent = React.createClass({

      displayName: 'MyComponent',

      mixins: [StateFromStoreMixin],

      getStoreStateMapping: function () {
        return {
          myStore: ['data'],
        };
      },

      storeStateWillUpdate: function (partialNextState, previousState, currentProps) {
        should.deepEqual(previousState, {
          stores: {
            myStore: {
              data: oldData,
            },
          },
        });

        should.deepEqual(currentProps, { prop: 'value' });

        partialNextState.test = partialNextState.stores.myStore.data * 2;
      },

      render: function () {
        return null;
      },

    });

    var element = React.createElement(MyComponent, { prop: 'value' });
    var renderedComponent = React.addons.TestUtils.renderIntoDocument(element);

    should.deepEqual(renderedComponent.state, {
      stores: {
        myStore: {
          data: oldData,
        },
      },
    });

    floox.actions.myAction();

    should.deepEqual(renderedComponent.state, {
      test: floox.stores.myStore.data() * 2,
      stores: {
        myStore: {
          data: floox.stores.myStore.data(),
        },
      },
    });
  });

});
