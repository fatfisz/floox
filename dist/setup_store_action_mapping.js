"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = setupStoreActionMapping;
function addDispatcherAction(internals, actionName) {
  var dispatcherActions = internals.dispatcherActions;
  var actions = internals.actions;
  var dispatcherAction = internals.dispatch.bind(null, actionName);

  dispatcherActions[actionName] = dispatcherAction;

  if (!actions.hasOwnProperty(actionName)) {
    actions[actionName] = dispatcherAction;
  }
}

function setupStoreActionMapping(handlers, internals) {
  var mapping = internals.actionMapping;
  var dispatcherActions = internals.dispatcherActions;

  Object.keys(handlers).forEach(function (actionName) {
    var handler = handlers[actionName];

    if (!dispatcherActions.hasOwnProperty(actionName)) {
      addDispatcherAction(internals, actionName);
    }

    mapping[actionName] = handler;
  });
}

module.exports = exports["default"];
