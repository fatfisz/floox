'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createStore;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _setup_store = require('./setup_store');

var _setup_store2 = _interopRequireDefault(_setup_store);

function createStore(internals, store) {
  var name = 'floox';
  var stores = internals.stores;
  var storesByName = internals.storesByName;
  var dispatchTokens = internals.dispatchTokens;

  if (process.env.NODE_ENV !== 'production' && storesByName.hasOwnProperty(name)) {
    throw new Error('Can\'t create the store twice');
  }

  var dispatchToken = (0, _setup_store2['default'])(store, name, internals);

  stores[name] = store;
  storesByName[name] = store;
  dispatchTokens[name] = dispatchToken;

  return store;
}

module.exports = exports['default'];
