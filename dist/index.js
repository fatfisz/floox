'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createFloox;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _flux = require('flux');

var _create_action = require('./create_action');

var _create_action2 = _interopRequireDefault(_create_action);

var _create_mixin = require('./create_mixin');

var _create_mixin2 = _interopRequireDefault(_create_mixin);

var _create_store = require('./create_store');

var _create_store2 = _interopRequireDefault(_create_store);

var _dispatch = require('./dispatch');

var _dispatch2 = _interopRequireDefault(_dispatch);

function createFloox(store) {
  var dispatcher = new _flux.Dispatcher();

  var internals = {
    dispatcher: dispatcher,
    dispatch: _dispatch2['default'].bind(null, dispatcher),
    stores: {},
    storesByName: {},
    dispatchTokens: {},
    dispatcherActions: {},
    actions: {}
  };

  var mixin = (0, _create_mixin2['default'])(internals);

  (0, _create_store2['default'])(internals, store);

  return {
    stores: internals.stores,
    actions: internals.actions,
    createAction: _create_action2['default'].bind(null, internals),
    StateFromStoreMixin: mixin
  };
}

module.exports = exports['default'];
