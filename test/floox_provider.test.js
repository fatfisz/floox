'use strict';

const React = require('react');
const ReactTestUtils = require('react-addons-test-utils');
const should = require('should/as-function');
const sinon = require('sinon');

const Floox = require('../dist/floox_class');
const FlooxProvider = require('../dist/floox_provider');


describe('FlooxProvider', () => {
  let renderer;

  beforeEach(() => {
    renderer = ReactTestUtils.createRenderer();
  });

  describe('instantiating', () => {
    let React;

    beforeEach(() => {
      // React caches info about warnings, so to properly test them the module
      // cache has to be flushed.
      // See: https://github.com/facebook/react/issues/4302
      Object.keys(require.cache).forEach((key) => {
        delete require.cache[key];
      });

      // eslint-disable-next-line global-require
      React = require('react');

      // Stub to prevent writing messages to stdout.
      sinon.stub(global.console, 'error');
    });

    afterEach(() => {
      global.console.error.restore();
    });

    it('should warn if there are no props', () => {
      const element = React.createElement(FlooxProvider);

      try {
        renderer.render(element);
      } catch (err) {
        // Do nothing
      }

      should(global.console.error).be.calledWith(
        'Warning: Failed propType: Required prop `config` was not specified in `FlooxProvider`.');
    });

    it('should warn if the required props are missing', () => {
      const element = React.createElement(FlooxProvider, {});

      try {
        renderer.render(element);
      } catch (err) {
        // Do nothing
      }

      should(global.console.error).be.calledWith(
        'Warning: Failed propType: Required prop `config` was not specified in `FlooxProvider`.');
    });

    it('should warn if the required `getInitialState` method is missing', () => {
      const element = React.createElement(FlooxProvider, {
        config: {},
      });

      try {
        renderer.render(element);
      } catch (err) {
        // Do nothing
      }

      should(global.console.error).be.calledWith(
        'Warning: Failed propType: Required prop `config.getInitialState` was not specified in `FlooxProvider`.');
    });

    it('should throw if the children are missing', () => {
      const element = React.createElement(FlooxProvider, {
        config: {
          getInitialState() {},
        },
      });

      should(() => {
        renderer.render(element);
      }).throw('onlyChild must be passed a children with exactly one child.');
    });

    it('should throw if there are many children', () => {
      const element = React.createElement(FlooxProvider, {
        config: {
          getInitialState() {},
        },
      }, React.DOM.div(), React.DOM.div());

      should(() => {
        renderer.render(element);
      }).throw('onlyChild must be passed a children with exactly one child.');
    });

    it('should pass if the config is valid and there is exactly one child', () => {
      const element = React.createElement(FlooxProvider, {
        config: {
          getInitialState() {},
        },
      }, React.DOM.div());

      should(() => {
        renderer.render(element);
      }).not.throw();
    });
  });

  describe('instance', () => {
    const instanceMethodName = 'specialMethod';
    let instance;

    beforeEach(() => {
      const element = React.createElement(FlooxProvider, {
        config: {
          getInitialState() {},
          [instanceMethodName]() {},
        },
      }, React.DOM.div());

      renderer.render(element);
      // Use `renderer.getMountedInstance` when it is available
      instance = renderer._instance._instance;
    });

    it('should have the `floox` property', () => {
      should(instance.floox).be.instanceOf(Floox);
    });

    it('should use passed config for the `floox` property', () => {
      should(instance.floox).have.property(instanceMethodName);
    });

    it('should return the proper child context', () => {
      const childContext = instance.getChildContext();

      should(childContext).be.eql({
        floox: instance.floox,
      });
    });
  });
});
