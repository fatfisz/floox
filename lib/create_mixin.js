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
      'Store "' + storeName + '" doesn\'t have "' + propertyName + '" property'
    );
  }

  if (typeof store[propertyName] === 'function') {
    mapping.push(getMethodGetter(store, propertyName, key));
  } else {
    mapping.push(getPropertyGetter(store, propertyName, key));
  }
}

function processStoreStateMapping(storesByName, storeStateMapping) {
  var newStoreStateMapping = {};

  forEachNestedProperty(storeStateMapping, function (propertyName, value, key) {
    var isArray = Array.isArray(value);
    var storeName = propertyName;

    if (!isArray) {
      storeName = storeName.substring(0, storeName.lastIndexOf('.'));
    }

    if (process.env.NODE_ENV !== 'production') {
      if (propertyName === key && !isArray) { // root-level property that is not an array
        throw new Error(
          'Expected "' + propertyName + '" property to be an array or an object'
        );
      }

      if (!isArray && typeof value !== 'string') {
        throw new Error(
          'Expected "' + propertyName + '" property to be an array, an object, or a string'
        );
      }

      if (!storesByName.hasOwnProperty(storeName)) {
        throw new Error('Store "' + storeName + '" doesn\'t exist');
      }
    }

    if (!newStoreStateMapping[storeName]) {
      newStoreStateMapping[storeName] = [];
    }

    var mapping = newStoreStateMapping[storeName];
    var store = storesByName[storeName];

    if (isArray) {
      value.forEach(function (name) {
        addStoreProperty(mapping, store, storeName, name, name);
      });
    } else {
      addStoreProperty(mapping, store, storeName, value, key);
    }
  });

  return newStoreStateMapping;
}

module.exports = function createMixin(internals) {
  var storesByName = internals.storesByName;
  var storeStateMapping;
  var mappedStoreNames;

  function init() {
    if (process.env.NODE_ENV !== 'production' &&
        !this.hasOwnProperty('getStoreStateMapping')) {
      throw new Error('Component should have a "getStoreStateMapping" method');
    }

    storeStateMapping = processStoreStateMapping(
      storesByName,
      this.getStoreStateMapping()
    );
    mappedStoreNames = Object.keys(storeStateMapping);
  }

  function getStateFromStore(stores, storeName) {
    var mapping = storeStateMapping[storeName];
    var storeState = mapping.reduce(function (acc, getter) {
      return getter(acc);
    }, {});

    nsProps.set(stores, storeName, storeState);

    return stores;
  }

  function getStateFromStores(changedStore, previousState) {
    if (changedStore) {
      return {
        stores: getStateFromStore(previousState.stores, changedStore),
      };
    }

    return {
      stores: mappedStoreNames.reduce(getStateFromStore, {}),
    };
  }

  function updateState(changedStore) {
    this.setState(getStateFromStores.bind(this, changedStore));
  }

  function getListenerConnector(method) {
    return function listenerConnector() {
      mappedStoreNames.forEach(function (storeName) {
        storesByName[storeName][method]('change', updateState.bind(this, storeName));
      }.bind(this));
    };
  }

  return {

    getInitialState: function () {
      init.call(this);
      return getStateFromStores();
    },

    componentDidMount: getListenerConnector('on'),
    componentWillUnmount: getListenerConnector('off'),

  };
};
