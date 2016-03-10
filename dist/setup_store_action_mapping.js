"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = setupStoreActionMapping;

function setupStoreActionMapping(handlers, internals) {
  var actions = internals.actions;
  var actionMapping = internals.actionMapping;
  var dispatch = internals.dispatch;
  var dispatcherActions = internals.dispatcherActions;

  Object.keys(handlers).forEach(function (actionName) {
    var handler = handlers[actionName];

    if (!dispatcherActions.hasOwnProperty(actionName)) {
      var dispatcherAction = dispatch.bind(null, actionName);

      dispatcherActions[actionName] = dispatcherAction;

      if (!actions.hasOwnProperty(actionName)) {
        actions[actionName] = dispatcherAction;
      }
    }

    actionMapping[actionName] = handler;
  });
}

module.exports = exports["default"];
