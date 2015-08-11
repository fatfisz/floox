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

module.exports = function createMixin(internals) {
  var storesByName = internals.storesByName;
  var componentName;
  var storeStateMapping;
  var mappedStoreNames;
  var listenerByName;

  function addStoreProperty(mapping, store, storeName, propertyName, key) {
    if (process.env.NODE_ENV !== 'production' &&
        !store.hasOwnProperty(propertyName)) {
      throw new Error(
        '[' + componentName + '] Store "' + storeName + '" doesn\'t have "' +
        propertyName + '" property'
      );
    }

    if (typeof store[propertyName] === 'function') {
      mapping.push(getMethodGetter(store, propertyName, key));
    } else {
      mapping.push(getPropertyGetter(store, propertyName, key));
    }
  }

  function processStoreStateMapping(storeStateMapping) {
    var newStoreStateMapping = {};

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
            '[' + componentName + '] Expected "' + propertyName +
            '" property to be an array or an object'
          );
        }

        if (!isArray && typeof value !== 'string') {
          throw new Error(
            '[' + componentName + '] Expected "' + propertyName +
            '" property to be an array, an object, or a string'
          );
        }

        if (!storesByName.hasOwnProperty(storeName)) {
          throw new Error(
            '[' + componentName + '] Store "' + storeName + '" doesn\'t exist'
          );
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

  function init() {
    if (process.env.NODE_ENV !== 'production') {
      componentName = this.constructor.displayName || defaultComponentName;

      if (!this.hasOwnProperty('getStoreStateMapping')) {
        throw new Error(
          'Component "' + componentName +
          '" should have a "getStoreStateMapping" method'
        );
      }
    }

    storeStateMapping = processStoreStateMapping(this.getStoreStateMapping());
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
      if (process.env.NODE_ENV !== 'production') {
        if (method === 'on' && listenerByName) {
          throw new Error(
            'Tried to attach listeners twice on component "' + componentName +
            '"'
          );
        }
        if (method === 'off' && !listenerByName) {
          throw new Error(
            'Tried to detach listeners twice on component "' + componentName +
            '"'
          );
        }
      }

      if (method === 'on') {
        listenerByName = {};

        mappedStoreNames.forEach(function (storeName) {
          listenerByName[storeName] = updateState.bind(this, storeName);
        }.bind(this));
      }

      mappedStoreNames.forEach(function (storeName) {
        storesByName[storeName][method]('change', listenerByName[storeName]);
      });

      if (method === 'off') {
        listenerByName = null;
      }
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
