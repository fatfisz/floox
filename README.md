# floox

> A nice framework for Flux

## Getting Started

Install the package with this command:
```shell
npm install floox --save
```

## Glossary

* production env - means an environment in which environment variable `NODE_ENV` is set to `production`
* development env - opposite of the production env

## Basic usage

The starting point for floox are stores - they keep data, define actions (a bit non-conventional, see [explanation](#why-not-define-actions-explicitly)), and can emit events.
Let's look at an example store:

```js
var floox = require('floox');

floox.createStore('myStore', {

  _data: null,

  data() {
    return this._data;
  },

  handlers: {
    myAction(data) {
      this.data = data;
      this.emit('change');
    },
  },

});
```

This store:
* stores a piece of data and allows retrieving it by calling `floox.stores.myStore.data()`
* defines an action `myAction` which can be dispatched by calling `floox.actions.myAction(data)`
* emits and enables listening to the event `change` through use of methods `emit`, `on`, and `off`.

A React component that gets some data for the state from store can then look like this:

```js
module.exports = React.createClass({

  getInitialState() {
    return {
      data: floox.stores.myStore.data(),
    };
  },

  componentDidMount() {
    floox.stores.myStore.on('change', this.updateStateFromStore);
  },

  componentWillUnmount() {
    floox.stores.myStore.off('change', this.updateStateFromStore);
  },

  render() {
    var { data } = this.state;

    return <div onClick={this.dispatch}>{data}</div>;
  },

  updateStateFromStore() {
    this.setState({
      data: floox.stores.myStore.data(),
    });
  },

  dispatch() {
    floox.actions.myAction('some data');
  },

});
```

Or event shorter, using floox's StateFromStoreMixin:

```js
module.exports = React.createClass({

  mixins: [floox.StateFromStoreMixin],

  getStoreStateMapping() {
    return {
      myStore: ['data'],
    };
  },

  render() {
    var { data } = this.state.stores.myStore;

    return <div onClick={this.dispatch}>{data}</div>;
  },

  dispatch() {
    floox.actions.myAction('some data');
  },

});
```

For more info on the mixin, look [in the API section](#flooxstatefromstoremixin).

## More advanced concepts

### Factory

If your project needs multiple dispatchers, you can use the floox factory, like so:

```js
var createFloox = require('floox/factory');
var floox = createFloox();
```

In fact, the singleton object from `require('floox')` is created by this factory.

Floox instances don't share any data (e. g. Flux dispatchers) and are independent.

### Namespaces

Floox treats action and store names containing dots as namespaces.
For example, if you create a store by calling `floox.createStore('some.namespaced.store', { ... })` then you will be able to access that store from `floox.stores.some.namespaced.store`.

### Creating additional actions

Action creators (accessed through `floox.actions.<action name>`) are set up automatically when adding stores.
They all take one argument which is then passed to action handlers during a dispatch.

There is also a way to create custom action creators, also accessible through `floox.actions.<action name>`, so that all action creators are in one place.
However, because custom action creator's name can overshadow the original action creator, there's a built-in mechanism for preserving the access to them.

```js
floox.createAction('newAction', (dispatcherActions, data) => {
  setTimeout(() => {
    dispatcherActions.myAction(data);
  }, 1000);
});
```

The first argument is an object containing the original actions, and the second one is the data the action was called with.
The new action can be invoked like this: `floox.actions.newAction(data)`.

This allows modifying original actions by introducing data preprocessing, delaying dispatch, throttling, debouncing, etc.

## API

### floox.createStore(storeName, config)

Registers the store with name `storeName`.
It will be accessible through `floox.stores.<storeName>` (see: [Namespaces](#namespaces)).

There are some special properties which are processed during the creation process:

#### config.events
Type: `Array`
Default: `['change']`

Defines events handled by the store.
By default the `'change'` event is handled if not stated otherwise.
`emit(event)`, `on(event, listener)`, and `off(event, listener)` methods will be added to the store for emitting events, attaching listeners, and detaching them.
All of the methods will throw in development env if the event name is not contained in `config.events`.

#### config.maxListeners
Type: `Number`
Default: the same as node.js EventEmitter default, `10`

Floox uses node.js implementation of EventEmitter internally.
That means a warning is printed when there are more listeners than 10.
To change that behaviour set either [`EventEmitter.defaultMaxListeners`](https://nodejs.org/api/events.html#events_eventemitter_defaultmaxlisteners) or `config.maxListeners` to more than 10 (or 0 for unlimited listeners).

This may change in the future if another implementation of EventEmitter is used.

#### config.handlers
Type: `Object`
Default: `undefined`

Defines actions that this store handles, for example:

```js
handlers: {

  myAction(data) { ... },

  namespace: {

    anotherAction(data) { ... },

  },

  'namespace.yetAnotherAction'() { ... },

}
```

This configuration will result in three actions being registered in floox: `floox.actions.myAction`, `floox.namespace.anotherAction`, and `floox.namespace.yetAnotherAction`.
Use whichever method you prefer to name actions.

If there are two actions with the same name declared in a store, an error will be thrown.

### floox.stores.\<store name>

Each store registered through `floox.createStore` will be accessible like this.
One store repository prevents problems stemming from circular dependencies.

### floox.stores.\<store name>.emit(event)

Emits `event` on the store.
Throws in development env if the event name is not contained in `config.events`.

This method shouldn't be used externally, but accessed only by store methods through `this.emit`.

### floox.stores.\<store name>.on(event, listener)

Attaches a `listener` for `event` on the store.
Throws in development env if the event name is not contained in `config.events`.

### floox.stores.\<store name>.off(event, listener)

Detaches a `listener` for `event` on the store.
Throws in development env if the event name is not contained in `config.events`.

### floox.stores.\<store name>.waitFor(storeNames)

Waits until stores listed in an array `storeNames` are finished with handling the action that is currently dispatched.

This method shouldn't be used externally, but accessed only by store methods through `this.waitFor`.

Store names should contain the namespace if there is any, e. g.

```js
handlers: {

  myAction(data) {
    this.waitFor(['otherStore', 'some.namespaced.store']);
    ...
  },

}
```

This method throws if there is a circular dependency detected (e. g. A waits for B, and B waits for A).

### floox.createAction(actionName, action)

Registers a custom action with name `actionName`.
It will be accessible through `floox.stores.<actionName>` (see: [Namespaces](#namespaces)).

`action` should be a function with arguments `dispatcherActions` and `data`, where `dispatcherActions` will be the internal object containing originally defined actions and `data` will be the data passed while invoking the action.
For example see: [Creating additional actions](#creating-additional-actions).

### floox.actions.\<action name>

Each action registered either through store configuration or by `floox.createAction` will be accessible like this.

Actions creators should be invoked with at most one argument, which then will be passed to action handlers in stores during dispatch.

Dispatching another action in the middle of a dispatch will result in an error being thrown.

### floox.StateFromStoreMixin

The mixin which you can use in your React components.
It has access to all the stores registered in the `floox` instance it is taken from, so no additional linking is needed.

This mixin requires a `getStoreStateMapping` method to be included in the component.
The method should return an object, which then will be parsed similarly to the store config's `handlers` object, except that the values are required to be strings or arrays.
Let's look at an example:

```js
getStoreStateMapping: function () {
  return {
    store: {
      data: 'getData',
    },
    'namespaced.store': {
      data: 'getData',
    },
    namespaced: {
      otherStore: {
        data: 'rawData',
      },
    },
    anotherStore: ['rawData'],
  };
},
```

If the value is a string, then it should be either a store method or a property (methods will be called without arguments, with `this` set to the store, and the returned value will be saved).

If the value is an array, then it will be treatead the same as an object with keys being the elements of the array, and values mirroring the keys.
It's useful if you want the names of the getters in your stores to be the same as property names in the state.

Let's assume that in the example above `getData` are method names, and `rawData` is a non-method property.
Then the state will look like this:

```js
this.state = {
  stores: {
    store: {
      data: floox.store.getData(),
    },
    namespaced: {
      store: {
        data: floox.namespaced.store.getData(),
      },
      otherStore: {
        data: floox.namespaced.otherStore.rawData,
      },
    },
    anotherStore: {
      rawData: floox.anotherStore.rawData,
    },
  },
  ...
};
```

The mixin will register internal listeners for the `'change'` event for each mapped store and will update the state on change.
Only the data from the store which has emitted the `'change'` event is retrieved and the data from other stores remains unchanged.

**Remember to emit the `'change'` event if any data in the store has changed.**

#### component.storeStateWillUpdate(partialNextState, previousState, currentProps)

If this method is defined in a component, it will fire after retrieving data from the stores on change, and before calling `setState`.
It allows making changes to the state based on the data from stores by changing the `partialNextState` object.

The first argument is an object containing the `stores` property with the data already updated.

The second and third arguments are the arguments that are passed to the `setState` callback (see: [setState](https://facebook.github.io/react/docs/component-api.html#setstate)).

Any value returned by this method will be ignored.
Only modify the `partialNextState` object.

**The method is not called when initializing the component, only on subsequent updates.**

#### Batched updates

Use `React.addons.batchedUpdates` when you want to ensure that updates caused by handling an action will be batched so that minimal number of re-renders will occur.

```js
React.addons.batchedUpdates(function () {
  floox.actions.someAction();
});
```

This should batch any synchronous changes that occur while dispatching `someAction`.

## Why not define actions explicitly?

They are defined explicitly, but maybe not where you would expect them to be.

Actions are tied to stores - without a handler in the store there would be no point for an action to exist.
Defining constants that name action types is redundant if there is already a convention that ties action handler names to action types.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code with `npm test`.

## License
Copyright (c) 2015 FatFisz. Licensed under the MIT license.
