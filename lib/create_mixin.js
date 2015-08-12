/*
 * floox
 * https://github.com/fatfisz/floox
 *
 * Copyright (c) 2015 FatFisz
 * Licensed under the MIT license.
 */

'use strict';

var nsProps = require('ns-props');

var forEachNestedProperty = require('./for_each_nested_property');


var defaultComponentName = '<anonymous>';

function getPropertyGetter(store, propertyName, key) {
  return function getPropertyValue(storeState) {
    storeState[key] = store[propertyName];
    return storeState;
  };
}

function getMethodGetter(store, propertyName, key) {
  return function getMethodResult(storeState) {
    storeState[key] = store[propertyName]();
    return storeState;
  };
}

function addStoreProperty(mapping, store, storeName, propertyName, key) {
  if (process.env.NODE_ENV !== 'production' &&
      !store.hasOwnProperty(propertyName)) {
    throw new Error(
      '[' + this._floox.componentName + '] Store "' + storeName +
      '" doesn\'t have "' + propertyName + '" property'
    );
  }

  if (typeof store[propertyName] === 'function') {
    mapping.push(getMethodGetter(store, propertyName, key));
  } else {
    mapping.push(getPropertyGetter(store, propertyName, key));
  }
}

function getProcessedStoreStateMapping() {
  var storeStateMapping = this.getStoreStateMapping();
  var processedStoreStateMapping = {};

  forEachNestedProperty(storeStateMapping, function (propertyName, value, key) {
    var isArray = Array.isArray(value);
    var storeName = propertyName;

    if (!isArray) {
      storeName = storeName.substring(0, storeName.lastIndexOf('.'));
    }

    if (process.env.NODE_ENV !== 'production') {
      if (propertyName === key && !isArray) {
        // root-level property that is not an array
        throw new Error(
          '[' + this._floox.componentName + '] Expected "' + propertyName +
          '" property to be an array or an object'
        );
      }

      if (!isArray && typeof value !== 'string') {
        throw new Error(
          '[' + this._floox.componentName + '] Expected "' + propertyName +
          '" property to be an array, an object, or a string'
        );
      }

      if (!this._floox.storesByName.hasOwnProperty(storeName)) {
        throw new Error(
          '[' + this._floox.componentName + '] Store "' + storeName +
          '" doesn\'t exist'
        );
      }
    }

    if (!processedStoreStateMapping[storeName]) {
      processedStoreStateMapping[storeName] = [];
    }

    var mapping = processedStoreStateMapping[storeName];
    var store = this._floox.storesByName[storeName];

    if (isArray) {
      value.forEach(function (name) {
        addStoreProperty.call(this, mapping, store, storeName, name, name);
      }.bind(this));
    } else {
      addStoreProperty.call(this, mapping, store, storeName, value, key);
    }
  }.bind(this));

  return processedStoreStateMapping;
}

function init(storesByName) {
  this._floox = {
    storesByName: storesByName,
  };

  if (process.env.NODE_ENV !== 'production') {
    this._floox.componentName =
      this.constructor.displayName || defaultComponentName;

    if (!this.hasOwnProperty('getStoreStateMapping')) {
      throw new Error(
        'Component "' + this._floox.componentName +
        '" should have a "getStoreStateMapping" method'
      );
    }
  }

  this._floox.storeStateMapping = getProcessedStoreStateMapping.call(this);
  this._floox.mappedStoreNames = Object.keys(this._floox.storeStateMapping);
}

function getStateFromStore(stores, storeName) {
  var mapping = this._floox.storeStateMapping[storeName];
  var storeState = mapping.reduce(function (acc, getter) {
    return getter(acc);
  }, {});

  nsProps.set(stores, storeName, storeState);

  return stores;
}

function getStateFromStores(changedStore, previousState) {
  if (changedStore) {
    return {
      stores: getStateFromStore.call(this, previousState.stores, changedStore),
    };
  }

  return {
    stores: this._floox.mappedStoreNames.reduce(
      getStateFromStore.bind(this), {}
    ),
  };
}

function updateState(changedStore) {
  this.setState(getStateFromStores.bind(this, changedStore));
}

function getListenerConnector(method) {
  return function listenerConnector() {
    if (process.env.NODE_ENV !== 'production') {
      if (method === 'on' && this._floox.listenerByName) {
        throw new Error(
          'Tried to attach listeners twice on component "' +
          this._floox.componentName + '"'
        );
      }
      if (method === 'off' && !this._floox.listenerByName) {
        throw new Error(
          'Tried to detach listeners twice on component "' +
          this._floox.componentName + '"'
        );
      }
    }

    if (method === 'on') {
      this._floox.listenerByName = {};

      this._floox.mappedStoreNames.forEach(function (storeName) {
        this._floox.listenerByName[storeName] =
          updateState.bind(this, storeName);
      }.bind(this));
    }

    this._floox.mappedStoreNames.forEach(function (storeName) {
      this._floox.storesByName[storeName][method](
        'change',
        this._floox.listenerByName[storeName]
      );
    }.bind(this));

    if (method === 'off') {
      this._floox.listenerByName = null;
    }
  };
}

module.exports = function createMixin(internals) {
  return {

    getInitialState: function () {
      init.call(this, internals.storesByName);
      return getStateFromStores.call(this);
    },

    componentDidMount: getListenerConnector('on'),
    componentWillUnmount: getListenerConnector('off'),
  };
};
