# Floox 2

> Simple global state handling for React, inspired by Flux

[![Build Status](https://travis-ci.org/fatfisz/floox.svg?branch=master)](https://travis-ci.org/fatfisz/floox)
[![Dependency Status](https://david-dm.org/fatfisz/floox.svg)](https://david-dm.org/fatfisz/floox)
[![devDependency Status](https://david-dm.org/fatfisz/floox/dev-status.svg)](https://david-dm.org/fatfisz/floox#info=devDependencies)

Floox lets you manage the global state of your React app, while also protecting you from updates that are a direct result of other updates - to ensure the unidirectional data flow. All this while remaining simple and using

## Getting Started

Install the package with this command:
```shell
npm install floox --save
```

Floox 2 makes use of ES6 data structures, e.g. `WeakMap`, so ensure you have those too.

## Backstory

I was using Floox for a few months and I soon found out that there were some serious problems with it.
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
      clicks: this.state.clicks,
    });
  },
})
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

Once this is done, you can "connect" your components to Floox like this:
```js
const MyComponent = React.createClass({
  render() {
    return <div onClick={this.handleClick}>{this.props.clicks}</div>;
  },

  handleClick() {
    this.props.floox.increment();
  },
});

export default connectFloox(MyComponent, {
  clicks: true, // Here we pass the "clicks" property from the store
  floox: true, // We also pass the Floox instance for actions
});
```

## A bit more in-depth explanation

Floox instances provide the `setState` method for modifying the state returned by the user-defined `getInitialState` method.
You can define actions as calls to `setState`.
After `setState` is fired, all components connected to the Floox store will receive an update and pass the changed store values as props. Until all changes are applied and the components are re-rendered, you can't use `setState` - an error will be thrown to signal such situations.

## API

This section is still under construction!

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code with `npm test`.

## License
Copyright (c) 2016 FatFisz. Licensed under the MIT license.
