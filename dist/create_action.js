'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createAction;

function createAction(internals, name, action) {
  var actions = internals.actions;
  var dispatcherActions = internals.dispatcherActions;

  if (process.env.NODE_ENV !== 'production' && actions.hasOwnProperty(name) && (!dispatcherActions.hasOwnProperty(name) || actions[name] !== dispatcherActions[name])) {
    throw new Error('Action "' + name + '" is already registered');
  }

  var boundAction = action.bind(null, dispatcherActions);

  actions[name] = boundAction;

  return action;
}

module.exports = exports['default'];
