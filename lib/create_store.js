/*
 * floox
 * https://github.com/fatfisz/floox
 *
 * Copyright (c) 2015 FatFisz
 * Licensed under the MIT license.
 */

'use strict';

var nsProps = require('ns-props');

var setupStore = require('./setup_store');


module.exports = function createStore(internals, name, store) {
  var stores = internals.stores;
  var storesByName = internals.storesByName;
  var dispatchTokens = internals.dispatchTokens;

  if (process.env.NODE_ENV !== 'production' &&
      storesByName.hasOwnProperty(name)) {
    throw new Error('Store "' + name + '" is already registered');
  }

  var dispatchToken = setupStore(store, name, internals);

  nsProps.set(stores, name, store);
  storesByName[name] = store;
  dispatchTokens[name] = dispatchToken;

  return store;
};
