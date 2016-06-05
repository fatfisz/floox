'use strict';

const mockery = require('mockery');
const should = require('should/as-function');
const sinon = require('sinon');

const reactVersions = require('./react/versions');


function getFlooxProvider(React, Floox, floox) {
  return React.createClass({
    propTypes: {
      children: React.PropTypes.element.isRequired,
    },

    childContextTypes: {
      floox: React.PropTypes.instanceOf(Floox).isRequired,
    },

    getChildContext() {
      return { floox };
    },

    render() {
      return this.props.children;
    },
  });
}

function buildAndRender(React, FlooxProvider, Component, props) {
  const element = React.createElement(Component, props);
  const provider = React.createElement(FlooxProvider, {}, element);
  return React.addons.TestUtils.renderIntoDocument(provider);
}

function getConnector(React, tree) {
  const connector = React.addons.TestUtils.findAllInRenderedTree(
    tree,
    (component) => component.flooxUpdate
  )[0];

  should(connector).be.ok();

  if (!connector.render.isSinonProxy) {
    sinon.spy(connector, 'render');
  }

  return connector;
}

describe('connectFloox function', () => {
  reactVersions.forEach((version) => {
    describe(`React v. ${version}`, () => {
      let connectFloox;
      let Floox;
      let React;
      let ReactDOM;
      let renderer;

      beforeEach(() => {
        React = require(`./react/${version}`);
        mockery.registerMock('react', React);

        ReactDOM = React.__SECRET_DOM_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

        connectFloox = require('../tmp/connect_floox');
        Floox = require('../tmp/floox_class');


        // Stub to prevent writing messages to stdout.
        sinon.stub(global.console, 'error');

        renderer = React.addons.TestUtils.createRenderer();
      });

      afterEach(() => {
        global.console.error.restore();

        mockery.deregisterAll();
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
        const Component = connectFloox('test', {});
        const element = React.createElement(Component, {});
        const callback = sinon.spy(() => {
          should(instance.callback).be.equal(null);
        });

        renderer.render(element, { floox });
        const instance = renderer._instance._instance;

        should(instance.flooxUpdate).be.a.Function();
        should(instance.flooxUpdate).have.length(1);

        sinon.spy(instance, 'setState');

        instance.flooxUpdate(callback);

        should(instance.setState).be.calledOnce();
        should(instance.setState).be.calledWithExactly({}, sinon.match.func);
        should(callback).be.calledOnce();
        should(instance.callback).be.equal(null);
      });

      it('should add the listener on mount', () => {
        const addChangeListener = sinon.spy();
        const floox = {
          addChangeListener,
        };
        const Component = connectFloox('test', {});
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
        const Component = connectFloox('test', {});
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

          const FlooxProvider = getFlooxProvider(React, Floox, floox);
          const Component = connectFloox('test', {
            mappedString: true,
            mappedObject: true,
            floox: true,
          });
          const tree = buildAndRender(React, FlooxProvider, Component);
          connector = getConnector(React, tree);
        });

        it('should update even when nothing changes', () => {
          floox.setState({});

          should(connector.render).be.called();
        });

        it('should update when a property named "floox" is set', () => {
          floox.setState({
            floox: 'not today',
          });

          should(connector.render).be.called();
        });

        it('should update when a property that\'s mapped changes (string)', () => {
          floox.setState({
            mappedString: 'second',
          });

          should(connector.render).be.called();
        });

        it('should update when a property that\'s not mapped changes (string)', () => {
          floox.setState({
            notMappedString: 'second',
          });

          should(connector.render).be.called();
        });

        it('should update when a property that\'s mapped changes (object)', () => {
          floox.setState({
            mappedObject: secondObject,
          });

          should(connector.render).be.called();
        });

        it('should update when a property that\'s not mapped changes (object)', () => {
          floox.setState({
            notMappedObject: secondObject,
          });

          should(connector.render).be.called();
        });
      });

      describe('state updates with `shouldComponentUpdate`', () => {
        let connector;
        let floox;
        let FlooxProvider;
        let shouldComponentUpdate;

        beforeEach(() => {
          floox = new Floox({
            getInitialState() {
              return {
                flooxProp: 1,
              };
            },
          });
          FlooxProvider = getFlooxProvider(React, Floox, floox);
          shouldComponentUpdate = sinon.stub();
        });

        it('should call `shouldComponentUpdate` after the floox state has changed', () => {
          const Component = connectFloox('test', { flooxProp: true }, { shouldComponentUpdate });
          const tree = buildAndRender(React, FlooxProvider, Component, { prop: 1 });
          const connector = getConnector(React, tree);

          floox.setState({
            flooxProp: 2,
          });

          should(shouldComponentUpdate).be.calledOnce();
          should(shouldComponentUpdate).be.calledOn(connector);
          should(shouldComponentUpdate).be.calledWithExactly({ prop: 1 }, { flooxProp: 2 });
        });

        it('should call `shouldComponentUpdate` after the connector element props have changed', () => {
          const Component = connectFloox('test', { flooxProp: true }, { shouldComponentUpdate });

          const renderTarget = global.document.createElement('div');

          const element = React.createElement(Component, { prop: 1 });
          const provider = React.createElement(FlooxProvider, {}, element);
          const tree = ReactDOM.render(provider, renderTarget);
          const connector = getConnector(React, tree);

          const element2 = React.createElement(Component, { prop: 2 });
          const provider2 = React.createElement(FlooxProvider, {}, element2);
          const tree2 = ReactDOM.render(provider2, renderTarget);
          const connector2 = getConnector(React, tree2);

          should(connector).be.equal(connector2);
          should(shouldComponentUpdate).be.calledOnce();
          should(shouldComponentUpdate).be.calledOn(connector);
          should(shouldComponentUpdate).be.calledWithExactly({ prop: 2 }, { flooxProp: 1 });
        });

        it('should not render when `shouldComponentUpdate` returns `false`', () => {
          shouldComponentUpdate.returns(false);

          const Component = connectFloox('test', { flooxProp: true }, { shouldComponentUpdate });
          const tree = buildAndRender(React, FlooxProvider, Component);
          connector = getConnector(React, tree);

          floox.setState({
            flooxProp: 2,
          });

          should(connector.render).not.be.called();
        });

        it('should render when `shouldComponentUpdate` returns `true`', () => {
          shouldComponentUpdate.returns(true);

          const Component = connectFloox('test', { flooxProp: true }, { shouldComponentUpdate });
          const tree = buildAndRender(React, FlooxProvider, Component);
          connector = getConnector(React, tree);

          floox.setState({
            flooxProp: 2,
          });

          should(connector.render).be.called();
        });
      });

      it('should call the `flooxUpdate` callback even if the component is unmounted after `setState`', (done) => {
        // This documents the case described here: https://github.com/facebook/react/issues/6320
        let listener;
        let init;

        const FlooxProvider = getFlooxProvider(React, Floox, {
          addChangeListener(_listener) {
            listener = _listener;
          },
          removeChangeListener() {
            listener = null;
          },
        });

        const A = React.createClass({
          getInitialState() {
            return {
              shouldUpdate: false,
              showChild: true,
            };
          },

          componentDidMount() {
            init = this.update;
          },

          shouldComponentUpdate(nextProps, nextState) {
            return nextState.shouldUpdate;
          },

          render() {
            const child = this.state.showChild ? React.createElement(B) : null;
            return React.createElement('test', {}, child);
          },

          update() {
            this.setState({ shouldUpdate: false }, () => {
              this.setState({
                shouldUpdate: true,
                showChild: false,
              });
              listener(done);
            });
          },
        });

        const B = connectFloox(React.createClass({
          render() {
            return null;
          },
        }), {});

        buildAndRender(React, FlooxProvider, A);

        init();
      });

      it('should prevent calling listeners twice in one update cycle', () => {
        let init;

        const floox = new Floox({
          getInitialState() {
            return 1;
          },

          action(callback) {
            this.setState(2, callback);
          },

          messThingsUp() {
            this.setState(3);
          },
        });

        const FlooxProvider = getFlooxProvider(React, Floox, floox);

        const A = connectFloox(React.createClass({
          getInitialState() {
            return {
              shouldUpdate: false,
            };
          },

          componentDidMount() {
            init = this.update;
          },

          shouldComponentUpdate(nextProps, nextState) {
            return nextState.shouldUpdate;
          },

          render() {
            return null;
          },

          update() {
            this.setState({ shouldUpdate: false }, () => {
              floox.action(() => {
                floox.messThingsUp();
              });
            });
          },
        }), { floox: true });

        buildAndRender(React, FlooxProvider, A);

        init();
      });
    });
  });
});
