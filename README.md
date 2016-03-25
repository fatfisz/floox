# Floox 2

> Simple global state handling for React, inspired by Flux

[![Build Status](https://travis-ci.org/fatfisz/floox.svg?branch=master)](https://travis-ci.org/fatfisz/floox)
[![Dependency Status](https://david-dm.org/fatfisz/floox.svg)](https://david-dm.org/fatfisz/floox)
[![devDependency Status](https://david-dm.org/fatfisz/floox/dev-status.svg)](https://david-dm.org/fatfisz/floox#info=devDependencies)

Floox lets you manage the global state of your React app, while also protecting you from updates that are a direct result of other updates - to ensure the unidirectional data flow. All this while remaining simple and using methods similar to the ones used for managing component state.

## Getting Started

Install the package with this command:
```shell
npm install floox --save
```

Floox 2 makes use of ES6 data structures, e.g. `WeakMap`, so make sure you have those too.

## Backstory

I had been using Floox for a few months and I soon found out that there were some serious problems with it.
The `StateFromStoreMixin` mixin was useless in the isomorphic website scenarios because of its ties to the `floox` instances.
There were also some areas that were overly complicated: events, multiple stores, "namespaces", etc.

Floox 2 is a complete makeover of the previous API.
It now has no dependencies (the previous version relied on Event Emitter) and is quite lightweight (under 2kB minified + gzipped).

## Basic usage

First, let's import all important pieces of Floox:
```js
import { connectFloox, Floox, FlooxProvider } from 'floox';
```

Let's define a simple store with a `clicks` property and an action called `increment` that increments the `clicks` property.
```js
const floox = new Floox({
  getInitialState() {
    return {
      clicks: 0,
    };
  },

  increment() {
    this.setState({
      clicks: this.state.clicks + 1,
    });
  },
});
```

Before we are able to use the Floox store, we need to "provide" it to the React component tree. For that there is a component named `FlooxProvider`:
```js
ReactDOM.render(
  <FlooxProvider floox={floox}> // The only prop needs to be passed a Floox store
    // Then you can add your components, for example the react-router
    <Router history={history} routes={routes} />
  </FlooxProvider>,
  document
);
```

Once this is done, you can "connect" your components to the store like this:
```js
const MyComponent = React.createClass({
  render() {
    return (
      <button onClick={this.handleClick}>
        {this.props.clicks}
      </button>
    );
  },

  handleClick() {
    // Each click will cause the counter to increase
    this.props.floox.increment();
  },
});

export default connectFloox(MyComponent, {
  clicks: true, // Here we pass the "clicks" property from the store
  floox: true, // We also pass the Floox instance for actions
});
```

## A bit more in-depth explanation

Floox stores provide the `setState` method for modifying the state returned by the user-defined `getInitialState` method.
You can define actions as calls to `setState`.
After `setState` is fired, all components connected to the store will be updated and receive the changed store values as props. Until all changes are applied and the components are re-rendered, you can't use `setState` - an error will be thrown to signal such situations.

## API

The `'floox'` module exports only these: `connectFloox`, `Floox`, `FlooxProvider`.

### `Floox`

This is the class (or simply a constructor function with a few prototype methods) that is the brains of Floox 2. It should be initialized with a configuration object that should/may contain these:

#### `getInitialState()` (required)

This method should return the initial state of the store. It can be an object, a number, anything, as long as it can be later combined with whatever is passed to `setState`.

#### `combineState(currentState, partialState)` (optional)

This method takes care of updating the current state based on what is passed to `setState`. The default implementation does this:

1. If `partialState` is a function, set the current state to `partialState(currentState)` - this is useful for batched changes.
2. If both `currentState` and `partialState` are objects (`partialState` can also be `null`), then set the current state to `Object.assign(currentState, partialState)`.
3. Else the current state can't be extended by the partial state, so just set the current state to `partialState`.

Basically, this tries to extend (or transform with a function) the current state with a partial state, and in the case it's not possible, it replaces one with the other.
This is a little bit less restrictive than what's happening in React's own `setState`.

#### Other properties

As long as it is an own enumerable property of the config object and not one of the two methods above, it is assigned to the store instance too. That's where you will be declaring your actions.

--

The constructed Floox store has these properties:

#### `get state`

The `state` has only a getter to prevent setting the state without using the `setState` method. Inside actions you can use `this.state`.

#### `setState(partialState, [callback])`

The method combines the current state with the partial state, notifies all connected components through the listeners (they are set up automatically when you use `connectFloox`), and calls `callback` after the changes are applied (it's optional).
You won't be able to use `setState` before the previous call finishes (`callback` is the safe place to do it).

#### `batch(changes, [callback])`

This method allows you to collect `setState` calls inside the `changes` function and then apply the changes at once, similarly notifying all connected components and calling `callback` afterwards.
This is useful when you don't want each state change to cause re-rendering.
Because changes have to be made synchronously with `setState`, there is no space for any data flow loops, i.e. changes that induce other changes.
Use it like that:
```js
this.batch(() => {
  this.firstAction();
  this.secondAction();
});
```

The partial states are applied in the order of appearance.
The callbacks are also called in the order of appearance, with the callback passed to the `batch` method called last.
You can put calls to the `batch` method inside other `batch` calls - the changes will be applied just before the topmost `batch` call finishes.

#### `addChangeListener(listener)` and `removeChangeListener(listener)`

These methods are mainly for the internal usage.
They allow adding/removing a listener function, which will be called after the changes to the current state are made.
The listener is passed a callback which it has to call for the state transition to be finished.
If even one of the listeners fails to do so, you won't be able to use `setState` again.
The `connectFloox` function takes care of setting up/tearing down listeners and handling the callbacks, so you don't have to worry about it.

### `FlooxProvider`

A component that needs only a "floox" prop and a child.
The value passed as a "floox" prop should be an instance of the `Floox` class.
If none or more than one children are passed, an error will be thrown.

### `connectFloox(Component, mapping)`

This function wraps the passed `Component` with another component, which connects to the store using `addChangeListener` and `removeChangeListener`.

The `mapping` argument describes which store properties to pass as props to `Component` and how should they be named.
It should be an object with properties being either `true` or strings.
Let's consider a small example:
```js
connectFloox(Component, {
  sameValue: true,
  differentKey: 'differentValue',
});
```
This will fetch the `sameValue` and `differentKey` properties from the store state and pass them to `Component` as `sameValue` and `differentValue` props.
The mapping doesn't influence the actual values of the properties!

The `floox` mapping property is a special case - it will always point to the store itself.
This allows calling actions from components.

The props passed to the component wrapper are passed to the component itself.
Be careful, as they are overwritten by the store props!

Almost everything you need to know about how to use this (apart from the renamed properties) is contained in the [first example](#basic-usage).

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code with `npm test`.

## License
Copyright (c) 2016 FatFisz. Licensed under the MIT license.
