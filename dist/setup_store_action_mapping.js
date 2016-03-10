'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = setupStoreActionMapping;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nsProps = require('ns-props');

var _nsProps2 = _interopRequireDefault(_nsProps);

var _for_each_nested_property = require('./for_each_nested_property');

var _for_each_nested_property2 = _interopRequireDefault(_for_each_nested_property);

function addDispatcherAction(internals, actionName) {
  var dispatcherActions = internals.dispatcherActions;
  var actions = internals.actions;
  var dispatcherAction = internals.dispatch.bind(null, actionName);

  _nsProps2['default'].set(dispatcherActions, actionName, dispatcherAction);

  if (!_nsProps2['default'].has(actions, actionName)) {
    _nsProps2['default'].set(actions, actionName, dispatcherAction);
  }
}

function setupStoreActionMapping(handlers, internals) {
  var mapping = internals.actionMapping;
  var dispatcherActions = internals.dispatcherActions;

  (0, _for_each_nested_property2['default'])(handlers, function (actionName, handler) {
    if (process.env.NODE_ENV !== 'production' && mapping.hasOwnProperty(actionName)) {
      throw new Error('Store "' + internals.name + '" has duplicate action handlers "' + actionName + '"');
    }

    if (!_nsProps2['default'].has(dispatcherActions, actionName)) {
      addDispatcherAction(internals, actionName);
    } else if (process.env.NODE_ENV !== 'production' && typeof _nsProps2['default'].get(dispatcherActions, actionName) !== 'function') {
      throw new Error('Can\'t name a handler the same as an existing namespace "' + actionName + '"');
    }

    mapping[actionName] = handler;
  });
}

module.exports = exports['default'];
