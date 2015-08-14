/*
 * floox
 * https://github.com/fatfisz/floox
 *
 * Copyright (c) 2015 FatFisz
 * Licensed under the MIT license.
 */

'use strict';

var nsProps = require('ns-props');


module.exports = function createAction(internals, name, action) {
  var dispatcherActions = internals.dispatcherActions;
  var actions = internals.actions;

  if (process.env.NODE_ENV !== 'production' &&
      nsProps.has(actions, name) && (
        !nsProps.has(dispatcherActions, name) ||
        nsProps.get(actions, name) !== nsProps.get(dispatcherActions, name)
      )) {
    throw new Error('Action "' + name + '" is already registered');
  }

  var boundAction = action.bind(null, dispatcherActions);

  nsProps.set(actions, name, boundAction);

  return action;
};
