/*
 * floox
 * https://github.com/fatfisz/floox
 *
 * Copyright (c) 2015 FatFisz
 * Licensed under the MIT license.
 */

'use strict';

var nsProps = require('ns-props');

var forEachNestedProperty = require('./for_each_nested_property');


function addDispatcherAction(internals, actionName) {
  var dispatcherActions = internals.dispatcherActions;
  var actions = internals.actions;
  var dispatcherAction = internals.dispatch.bind(null, actionName);

  nsProps.set(dispatcherActions, actionName, dispatcherAction);

  if (!nsProps.has(actions, actionName)) {
    nsProps.set(actions, actionName, dispatcherAction);
  }
}

module.exports = function setupStoreActionMapping(handlers, internals) {
  var mapping = internals.actionMapping;
  var dispatcherActions = internals.dispatcherActions;

  forEachNestedProperty(handlers, function (actionName, handler) {
    if (process.env.NODE_ENV !== 'production' &&
        mapping.hasOwnProperty(actionName)) {
      throw new Error(
        'Store "' + internals.name + '" has duplicate action handlers "' + actionName + '"'
      );
    }

    if (!nsProps.has(dispatcherActions, actionName)) {
      addDispatcherAction(internals, actionName);
    } else if (process.env.NODE_ENV !== 'production' &&
               typeof nsProps.get(dispatcherActions, actionName) !== 'function') {
      throw new Error(
        'Can\'t name a handler the same as an existing namespace "' + actionName + '"'
      );
    }

    mapping[actionName] = handler;
  });
};
