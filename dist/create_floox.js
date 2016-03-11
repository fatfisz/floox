'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createFloox;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _create_mixin = require('./create_mixin');

var _create_mixin2 = _interopRequireDefault(_create_mixin);

var _setup_store_action_mapping = require('./setup_store_action_mapping');

var _setup_store_action_mapping2 = _interopRequireDefault(_setup_store_action_mapping);

var _setup_store_events = require('./setup_store_events');

var _setup_store_events2 = _interopRequireDefault(_setup_store_events);

function createFloox(store) {
  var actions = {};
  var internals = {
    store: store,
    dispatch: function dispatch(actionName, data) {
      if (dispatching) {
        throw new Error('Cannot dispatch in the middle of a dispatch.');
      }

      dispatching = true;

      if (internals.actionMapping.hasOwnProperty(actionName)) {
        internals.actionMapping[actionName].call(store, data);
      }

      dispatching = false;
    },
    actionMapping: {},
    dispatcherActions: {},
    actions: actions
  };
  var dispatching = false;

  var handlers = store.handlers;

  if (handlers) {
    (0, _setup_store_action_mapping2['default'])(handlers, internals);
  }

  (0, _setup_store_events2['default'])(store);

  return {
    store: store,
    actions: actions,
    createAction: function createAction(name, action) {
      var actions = internals.actions;
      var dispatcherActions = internals.dispatcherActions;

      if (process.env.NODE_ENV !== 'production' && actions.hasOwnProperty(name) && (!dispatcherActions.hasOwnProperty(name) || actions[name] !== dispatcherActions[name])) {
        throw new Error('Action "' + name + '" is already registered');
      }

      var boundAction = action.bind(null, dispatcherActions);

      actions[name] = boundAction;

      return action;
    },
    StateFromStoreMixin: (0, _create_mixin2['default'])(internals)
  };
}

module.exports = exports['default'];
