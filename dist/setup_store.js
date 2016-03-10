'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = setupStore;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _setup_store_action_mapping = require('./setup_store_action_mapping');

var _setup_store_action_mapping2 = _interopRequireDefault(_setup_store_action_mapping);

var _setup_store_events = require('./setup_store_events');

var _setup_store_events2 = _interopRequireDefault(_setup_store_events);

function registerStoreInDispatcher(store, dispatcher, actionMapping) {
  return dispatcher.register(function (action) {
    var actionName = action.actionName;

    if (actionMapping.hasOwnProperty(actionName)) {
      actionMapping[actionName].call(store, action.data);
    }
  });
}

function setupStore(store, internals) {
  var handlers = store.handlers;

  var actionMapping = {};
  var actionMappingInternals = _extends({
    actionMapping: actionMapping
  }, internals);

  if (handlers) {
    (0, _setup_store_action_mapping2['default'])(handlers, actionMappingInternals);
  }

  (0, _setup_store_events2['default'])(store);

  return registerStoreInDispatcher(store, internals.dispatcher, actionMapping);
}

module.exports = exports['default'];
