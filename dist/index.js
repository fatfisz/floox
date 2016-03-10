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

var _setup_store = require('./setup_store');

var _setup_store2 = _interopRequireDefault(_setup_store);

function createFloox(store) {
  var dispatcher = new _flux.Dispatcher();
  var actions = {};
  var internals = {
    store: store,
    dispatcher: dispatcher,
    dispatch: function dispatch(actionName, data) {
      dispatcher.dispatch({
        actionName: actionName,
        data: data
      });
    },
    dispatcherActions: {},
    actions: actions
  };

  (0, _setup_store2['default'])(store, internals);

  return {
    store: store,
    actions: actions,
    createAction: _create_action2['default'].bind(null, internals),
    StateFromStoreMixin: (0, _create_mixin2['default'])(internals)
  };
}

module.exports = exports['default'];
