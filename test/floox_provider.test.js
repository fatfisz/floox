'use strict';

const React = require('react');
const ReactTestUtils = require('react-addons-test-utils');
const should = require('should/as-function');
const sinon = require('sinon');

const Floox = require('../dist/floox_class');
const FlooxProvider = require('../dist/floox_provider');


describe('FlooxProvider', () => {
  const Test = React.createFactory('test');
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
        'Warning: Failed propType: Required prop `floox` was not specified in `FlooxProvider`.');
    });

    it('should warn if the required props are missing', () => {
      const element = React.createElement(FlooxProvider, {});

      try {
        renderer.render(element);
      } catch (err) {
        // Do nothing
      }

      should(global.console.error).be.calledWith(
        'Warning: Failed propType: Required prop `floox` was not specified in `FlooxProvider`.');
    });

    it('should warn if the `floox` prop is not an instance of the Floox class', () => {
      const element = React.createElement(FlooxProvider, {
        floox: {},
      });

      try {
        renderer.render(element);
      } catch (err) {
        // Do nothing
      }

      should(global.console.error).be.calledWith(
        'Warning: Failed propType: Invalid prop `floox` of type `Object` supplied to `FlooxProvider`, expected instance of `Floox`.');
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
      }, Test(), Test());

      should(() => {
        renderer.render(element);
      }).throw('onlyChild must be passed a children with exactly one child.');
    });

    it('should pass if the config is valid and there is exactly one child', () => {
      const element = React.createElement(FlooxProvider, {
        config: {
          getInitialState() {},
        },
      }, Test());

      should(() => {
        renderer.render(element);
      }).not.throw();
    });
  });

  describe('instance', () => {
    let floox;
    let instance;

    beforeEach(() => {
      floox = new Floox({
        getInitialState() {},
      });
      const element = React.createElement(FlooxProvider, { floox }, Test());

      renderer.render(element);
      // Use `renderer.getMountedInstance` when it is available
      instance = renderer._instance._instance;
    });

    it('should return the proper child context', () => {
      const childContext = instance.getChildContext();

      should(childContext).be.eql({
        floox,
      });
    });
  });
});
