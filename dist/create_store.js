'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createStore;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _setup_store = require('./setup_store');

var _setup_store2 = _interopRequireDefault(_setup_store);

function createStore(internals, name, store) {
  var stores = internals.stores;
  var storesByName = internals.storesByName;
  var dispatchTokens = internals.dispatchTokens;

  if (process.env.NODE_ENV !== 'production' && storesByName.hasOwnProperty(name)) {
    throw new Error('Store "' + name + '" is already registered');
  }

  var dispatchToken = (0, _setup_store2['default'])(store, name, internals);

  stores[name] = store;
  storesByName[name] = store;
  dispatchTokens[name] = dispatchToken;

  return store;
}

module.exports = exports['default'];
