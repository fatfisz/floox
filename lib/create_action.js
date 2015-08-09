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

  var boundAction = action.bind(null, dispatcherActions);

  nsProps.set(actions, name, boundAction);
};
