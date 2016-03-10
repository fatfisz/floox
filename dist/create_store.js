'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createStore;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _setup_store = require('./setup_store');

var _setup_store2 = _interopRequireDefault(_setup_store);

function createStore(internals, store) {
  (0, _setup_store2['default'])(store, internals);

  internals.store = store;

  return store;
}

module.exports = exports['default'];
