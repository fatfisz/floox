'use strict';

// Import jsdom and configure globals before loading React
const jsdom = require('jsdom');

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = global.document.defaultView;
global.navigator = {
  userAgent: 'node.js',
};

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-addons-test-utils');
const should = require('should');

const createFloox = require('../dist');


describe('Mixin', () => {
  let floox;
  let StateFromStoreMixin;
  let MyComponent;
  let renderedComponent;

  function shouldHaveCorrectState() {
    should(renderedComponent.state).eql({
      notImportant: 1,
      stores: {
        floox: {
          _data: floox.stores.floox._data,
          _updates: floox.stores.floox._updates,
          data: floox.stores.floox.data(),
          updates: floox.stores.floox.updates(),
        },
      },
    });
  }

  before(() => {
    floox = createFloox();

    StateFromStoreMixin = floox.StateFromStoreMixin;

    floox.createStore('dummy', {
      _data: 1,
      _updates: 0,

      data() {
        return this._data;
      },

      updates() {
        return this._updates;
      },

      handlers: {
        myAction() {
          this._data *= 2;
          this._updates += 1;
          this.emit('change');
        },
      },
    });


    MyComponent = React.createClass({
      mixins: [StateFromStoreMixin],

      getInitialState() {
        return {
          notImportant: 1,
        };
      },

      getStoreStateMapping() {
        return {
          floox: [
            '_data',
            '_updates',
            'data',
            'updates',
          ],
        };
      },

      render() {
        return React.DOM.div();
      },
    });
  });

  it('mixin should have all the right properties', () => {
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

  it('should throw if component doesn\'t have a "getStoreStateMapping" method', () => {
    const ComponentWithoutRequiredMethod = React.createClass({
      displayName: 'ComponentWithoutRequiredMethod',

      mixins: [StateFromStoreMixin],

      render() {
        return null;
      },
    });

    const element = React.createElement(ComponentWithoutRequiredMethod);

    should(() => {
      ReactTestUtils.renderIntoDocument(element);
    }).throw('Component "ComponentWithoutRequiredMethod" should have a "getStoreStateMapping" method');
  });

  it('should warn about bad property values', () => {
    function testValue(value, isNamespaced) {
      const storeName = isNamespaced ? 'namespaced.store' : 'store';

      const ComponentWithBadConfig = React.createClass({
        displayName: 'ComponentWithBadConfig',

        mixins: [StateFromStoreMixin],

        getStoreStateMapping() {
          const mapping = {};

          mapping[storeName] = value;
          return mapping;
        },

        render() {
          return null;
        },
      });

      const element = React.createElement(ComponentWithBadConfig);

      should(() => {
        ReactTestUtils.renderIntoDocument(element);
      }).throw(`[ComponentWithBadConfig] Expected "${storeName}" property to be an array or an object`);
    }

    testValue(1);
    testValue(1, true);
    testValue('test');
    testValue('test', true);
  });

  it('should warn about non-existing stores', () => {
    const ComponentWithBadConfig = React.createClass({
      displayName: 'ComponentWithBadConfig',

      mixins: [StateFromStoreMixin],

      getStoreStateMapping() {
        return {
          badStore: ['data'],
        };
      },

      render() {
        return null;
      },
    });

    const element = React.createElement(ComponentWithBadConfig);

    should(() => {
      ReactTestUtils.renderIntoDocument(element);
    }).throw('[ComponentWithBadConfig] Store "badStore" doesn\'t exist');
  });

  it('should warn about non-existing store properties (array)', () => {
    const ComponentWithBadConfig = React.createClass({
      displayName: 'ComponentWithBadConfig',

      mixins: [StateFromStoreMixin],

      getStoreStateMapping() {
        return {
          floox: ['nonExisting'],
        };
      },

      render() {
        return null;
      },
    });

    const element = React.createElement(ComponentWithBadConfig);

    should(() => {
      ReactTestUtils.renderIntoDocument(element);
    }).throw('[ComponentWithBadConfig] Store "floox" doesn\'t have "nonExisting" property');
  });

  it('should warn about non-existing store properties (object)', () => {
    const ComponentWithBadConfig = React.createClass({
      displayName: 'ComponentWithBadConfig',

      mixins: [StateFromStoreMixin],

      getStoreStateMapping() {
        return {
          floox: {
            data: 'nonExisting',
          },
        };
      },

      render() {
        return null;
      },
    });

    const element = React.createElement(ComponentWithBadConfig);

    should(() => {
      ReactTestUtils.renderIntoDocument(element);
    }).throw('[ComponentWithBadConfig] Store "floox" doesn\'t have "nonExisting" property');
  });

  it('should have the right initial state', () => {
    const element = React.createElement(MyComponent);

    renderedComponent = ReactTestUtils.renderIntoDocument(element);
    shouldHaveCorrectState();
  });

  it('should react to the changes caused by actions', () => {
    floox.actions.myAction();
    shouldHaveCorrectState();
  });

  it('should detach listeners properly when unmounting', () => {
    const container = ReactDOM.findDOMNode(renderedComponent);
    const element = React.createElement(MyComponent);

    ReactDOM.unmountComponentAtNode(container.parentNode);

    renderedComponent = ReactTestUtils.renderIntoDocument(element);
    shouldHaveCorrectState();

    floox.actions.myAction();
    shouldHaveCorrectState();
  });

  it('should handle the "storeStateWillUpdate" method', () => {
    const oldData = floox.stores.floox.data();

    const MyComponent = React.createClass({
      displayName: 'MyComponent',

      mixins: [StateFromStoreMixin],

      getStoreStateMapping() {
        return {
          floox: ['data'],
        };
      },

      storeStateWillUpdate(partialNextState, previousState, currentProps) {
        should(previousState).eql({
          stores: {
            floox: {
              data: oldData,
            },
          },
        });

        should(currentProps).eql({ prop: 'value' });

        partialNextState.test = partialNextState.stores.floox.data * 2;
      },

      render() {
        return null;
      },
    });

    const element = React.createElement(MyComponent, { prop: 'value' });
    const renderedComponent = ReactTestUtils.renderIntoDocument(element);

    should(renderedComponent.state).eql({
      stores: {
        floox: {
          data: oldData,
        },
      },
    });

    floox.actions.myAction();

    should(renderedComponent.state).eql({
      test: floox.stores.floox.data() * 2,
      stores: {
        floox: {
          data: floox.stores.floox.data(),
        },
      },
    });
  });
});
