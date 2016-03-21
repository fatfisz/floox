'use strict';

const React = require('react');
const ReactTestUtils = require('react-addons-test-utils');
const should = require('should/as-function');
const sinon = require('sinon');

const connectFloox = require('../dist/connect_floox');
const Floox = require('../dist/floox_class');


describe('connectFloox', () => {
  let renderer;

  beforeEach(() => {
    // Stub to prevent writing messages to stdout.
    sinon.stub(global.console, 'error');

    renderer = ReactTestUtils.createRenderer();
  });

  afterEach(() => {
    global.console.error.restore();
  });

  it('should throw if there is no component', () => {
    should(() => {
      connectFloox();
    }).throw('Expected Component to be a string (for built-in components) or a class/function (for composite components).');
  });

  it('should throw if the component has invalid type', () => {
    should(() => {
      connectFloox(null);
    }).throw('Expected Component to be a string (for built-in components) or a class/function (for composite components).');
  });

  it('should throw if there is no mapping', () => {
    should(() => {
      connectFloox('test');
    }).throw('Expected mapping to be an object.');
  });

  it('should throw if the mapping has invalid type', () => {
    should(() => {
      connectFloox('test', null);
    }).throw('Expected mapping to be an object.');
  });

  it('should render the passed component', () => {
    const type = `some type ${Math.random()}`;
    const Component = connectFloox(type, {});
    const element = React.createElement(Component, {});

    renderer.render(element, { floox: {} });
    const output = renderer.getRenderOutput();

    should(output.type).be.equal(type);
  });

  it('should pass the props from the Floox state', () => {
    const floox = {
      state: {
        testProp: 'test prop',
        anotherTestProp: 'another test prop',
        overwrittenProp: 'connector value',
        thisPropIsNotReferredTo: 'and so it won\'t be passed',
      },
    };
    const Component = connectFloox('test', {
      testProp: true,
      someOtherProp: 'anotherTestProp',
      overwrittenProp: true,
      missingProp: true,
    });
    const element = React.createElement(Component, {
      elementProp: 'element prop',
      overwrittenProp: 'element value',
    });

    renderer.render(element, { floox });
    const output = renderer.getRenderOutput();

    should(output.props).be.eql({
      testProp: 'test prop',
      someOtherProp: 'another test prop',
      overwrittenProp: 'connector value',
      elementProp: 'element prop',
      // eslint-disable-next-line no-undefined
      missingProp: undefined,
    });
  });

  it('should pass the Floox object if the target key is \'floox\'', () => {
    const floox = {
      state: {
        testProp: 'test prop',
      },
    };
    const Component = connectFloox('test', {
      floox: true,
      testProp: true,
    });
    const element = React.createElement(Component);

    renderer.render(element, { floox });
    const output = renderer.getRenderOutput();

    should(output.props).be.eql({
      floox,
      testProp: 'test prop',
    });
  });

  it('should warn if target keys are neither `true` nor strings', () => {
    connectFloox('test', {
      false: false,
      null: null,
      number: 42,
      object: {},
    });

    should(global.console.error).be.calledWith(
      'Warning: The value of the false property should be either "true" or a string, got false.');
    should(global.console.error).be.calledWith(
      'Warning: The value of the null property should be either "true" or a string, got null.');
    should(global.console.error).be.calledWith(
      'Warning: The value of the number property should be either "true" or a string, got 42.');
    should(global.console.error).be.calledWith(
      'Warning: The value of the object property should be either "true" or a string, got [object Object].');
  });

  it('should have the `flooxUpdate` method that updates the state', () => {
    const floox = {
      state: {},
    };
    const Component = connectFloox('div', {});
    const element = React.createElement(Component, {});
    const callback = () => {};

    renderer.render(element, { floox });
    const instance = renderer._instance._instance;

    should(instance.flooxUpdate).be.a.Function();
    should(instance.flooxUpdate).have.length(1);

    sinon.spy(instance, 'setState');

    instance.flooxUpdate(callback);

    should(instance.setState).be.calledOnce();
    should(instance.setState).be.calledWithExactly({}, callback);
  });

  it('should add the listener on mount', () => {
    const addChangeListener = sinon.spy();
    const floox = {
      addChangeListener,
    };
    const Component = connectFloox('div', {});
    const element = React.createElement(Component, {});

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
    const Component = connectFloox('div', {});
    const element = React.createElement(Component, {});

    renderer.render(element, { floox });
    const instance = renderer._instance._instance;

    instance.componentWillUnmount();

    should(removeChangeListener).be.calledOnce();
    should(removeChangeListener).be.calledWithExactly(instance.flooxUpdate);
  });

  describe('state updates', () => {
    const firstObject = new (function First() {});
    const secondObject = new (function Second() {});
    let floox;
    let connector;

    beforeEach(() => {
      floox = new Floox({
        getInitialState() {
          return {
            mappedString: 'first',
            mappedObject: firstObject,
            notMappedString: 'first',
            notMappedObject: firstObject,
          };
        },
      });
      const FlooxProvider = React.createClass({
        childContextTypes: {
          floox: React.PropTypes.instanceOf(Floox).isRequired,
        },

        getChildContext() {
          return {
            floox,
          };
        },

        render() {
          return this.props.children;
        },
      });
      const Component = connectFloox('div', {
        mappedString: true,
        mappedObject: true,
        floox: true,
      });
      const element = React.createElement(Component, {});
      const provider = React.createElement(FlooxProvider, {}, element);
      const tree = ReactTestUtils.renderIntoDocument(provider);
      connector = ReactTestUtils.findAllInRenderedTree(tree, (component) =>
        component.flooxUpdate
      )[0];

      should(connector).be.ok();

      sinon.spy(connector, 'render');
    });

    it('should not update when nothing changes', () => {
      floox.setState({});

      should(connector.render).not.be.called();
    });

    it('should not update when a property named "floox" is set', () => {
      floox.setState({
        floox: 'not today',
      });

      should(connector.render).not.be.called();
    });

    it('should update when a property that\'s mapped changes (string)', () => {
      floox.setState({
        mappedString: 'second',
      });

      should(connector.render).be.called();
    });

    it('should not update when a property that\'s not mapped changes (string)', () => {
      floox.setState({
        notMappedString: 'second',
      });

      should(connector.render).not.be.called();
    });

    it('should update when a property that\'s mapped changes (object)', () => {
      floox.setState({
        mappedObject: secondObject,
      });

      should(connector.render).be.called();
    });

    it('should not update when a property that\'s not mapped changes (object)', () => {
      floox.setState({
        notMappedObject: secondObject,
      });

      should(connector.render).not.be.called();
    });
  });
});
