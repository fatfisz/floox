'use strict';

const ReactTestUtils = require('react-addons-test-utils');
const should = require('should/as-function');
const sinon = require('sinon');


describe('FlooxProvider component', () => {
  let React;
  let Floox;
  let FlooxProvider;
  let renderer;
  let Test;

  beforeEach(() => {
    React = require('react');

    Floox = require('../dist/floox_class');
    FlooxProvider = require('../dist/floox_provider');


    renderer = ReactTestUtils.createRenderer();
    Test = React.createFactory('test');
  });

  describe('instantiating', () => {
    beforeEach(() => {
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
