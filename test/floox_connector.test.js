'use strict';

const ReactTestUtils = require('react-addons-test-utils');
const should = require('should/as-function');
const sinon = require('sinon');

const FlooxConnector = require('../dist/floox_connector');


describe('FlooxConnector', () => {
  let React;
  let renderer;

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

    renderer = ReactTestUtils.createRenderer();
  });

  afterEach(() => {
    global.console.error.restore();
  });

  it('should warn if the are no props', () => {
    const element = React.createElement(FlooxConnector);

    try {
      renderer.render(element);
    } catch (err) {
      // Do nothing
    }

    should(global.console.error).be.calledWith(
      'Warning: Failed Context Types: Required context `floox` was not specified in `FlooxConnector`.');
  });

  it('should throw if the children are missing', () => {
    const element = React.createElement(FlooxConnector);

    should(() => {
      renderer.render(element, { floox: {} });
    }).throw('onlyChild must be passed a children with exactly one child.');
  });

  it('should throw if there are many children', () => {
    const element = React.createElement(FlooxConnector, {}, React.DOM.div(), React.DOM.div());

    should(() => {
      renderer.render(element, { floox: {} });
    }).throw('onlyChild must be passed a children with exactly one child.');
  });

  it('should pass the props from the Floox state', () => {
    const floox = {
      state: {
        testProp: 'test prop',
        anotherTestProp: 'another test prop',
        overwrittenProp: 'parent value',
      },
    };
    const childElement = React.createElement('test', {
      childProp: 'child prop',
      overwrittenProp: 'child value',
    });
    const element = React.createElement(FlooxConnector, {
      testProp: true,
      someOtherProp: 'anotherTestProp',
      overwrittenProp: true,
      missingProp: true,
    }, childElement);

    renderer.render(element, { floox });
    const output = renderer.getRenderOutput();

    should(output.props).be.eql({
      floox,
      testProp: 'test prop',
      someOtherProp: 'another test prop',
      overwrittenProp: 'parent value',
      childProp: 'child prop',
      // eslint-disable-next-line no-undefined
      missingProp: undefined,
    });
  });

  it('should warn if a prop is not `true` nor a string', () => {
    const floox = {
      state: {},
    };
    const element = React.createElement(FlooxConnector, {
      false: false,
      null: null,
      number: 42,
      object: {},
    }, React.DOM.div());

    renderer.render(element, { floox });

    should(global.console.error).be.calledWith(
      'Warning: The value of the false prop should be "true" or a string.');
    should(global.console.error).be.calledWith(
      'Warning: The value of the null prop should be "true" or a string.');
    should(global.console.error).be.calledWith(
      'Warning: The value of the number prop should be "true" or a string.');
    should(global.console.error).be.calledWith(
      'Warning: The value of the object prop should be "true" or a string.');
  });

  it('should have the `flooxUpdate` method that forces update', () => {
    const floox = {
      state: {},
    };
    const element = React.createElement(FlooxConnector, {}, React.DOM.div());
    const callback = () => {};

    renderer.render(element, { floox });
    const instance = renderer._instance._instance;

    should(instance.flooxUpdate).be.a.Function();
    should(instance.flooxUpdate).have.length(1);

    sinon.spy(instance, 'forceUpdate');

    instance.flooxUpdate(callback);

    should(instance.forceUpdate).be.calledOnce();
    should(instance.forceUpdate).be.calledWithExactly(callback);
  });

  it('should add the listener on mount', () => {
    const addChangeListener = sinon.spy();
    const floox = {
      addChangeListener,
    };
    const element = React.createElement(FlooxConnector, {}, React.DOM.div());

    renderer.render(element, { floox });
    const instance = renderer._instance._instance;

    instance.componentDidMount();

    should(addChangeListener).be.calledOnce();
    should(addChangeListener).be.calledWithExactly(instance.flooxUpdate);
  });

  it('should remove the listener on unmount', () => {
    const removeChangeListener = sinon.spy();
    const floox = {
      removeChangeListener,
    };
    const element = React.createElement(FlooxConnector, {}, React.DOM.div());

    renderer.render(element, { floox });
    const instance = renderer._instance._instance;

    instance.componentWillUnmount();

    should(removeChangeListener).be.calledOnce();
    should(removeChangeListener).be.calledWithExactly(instance.flooxUpdate);
  });
});
