'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createAction;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nsProps = require('ns-props');

var _nsProps2 = _interopRequireDefault(_nsProps);

function createAction(internals, name, action) {
  var dispatcherActions = internals.dispatcherActions;
  var actions = internals.actions;

  if (process.env.NODE_ENV !== 'production' && _nsProps2['default'].has(actions, name) && (!_nsProps2['default'].has(dispatcherActions, name) || _nsProps2['default'].get(actions, name) !== _nsProps2['default'].get(dispatcherActions, name))) {
    throw new Error('Action "' + name + '" is already registered');
  }

  var boundAction = action.bind(null, dispatcherActions);

  _nsProps2['default'].set(actions, name, boundAction);

  return action;
}

module.exports = exports['default'];
