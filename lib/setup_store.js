/*
 * floox
 * https://github.com/fatfisz/floox
 *
 * Copyright (c) 2015 FatFisz
 * Licensed under the MIT license.
 */

'use strict';

var assign = require('object-assign');

var setupStoreActionMapping = require('./setup_store_action_mapping');
var setupStoreEvents = require('./setup_store_events');
var waitFor = require('./wait_for');


function registerStoreInDispatcher(store, dispatcher, actionMapping) {
  return dispatcher.register(function (action) {
    var actionName = action.actionName;

    if (actionMapping.hasOwnProperty(actionName)) {
      actionMapping[actionName].call(store, action.data);
    }
  });
}

module.exports = function setupStore(store, name, internals) {
  var handlers = store.handlers;
  var actionMapping = {};

  var actionMappingInternals = assign(
    {
      name: name,
      actionMapping: actionMapping,
    },
    internals
  );

  if (handlers) {
    setupStoreActionMapping(handlers, actionMappingInternals);
    store.waitFor = waitFor.bind(null, internals);
  }

  setupStoreEvents(store, name);

  return registerStoreInDispatcher(store, internals.dispatcher, actionMapping);
};
