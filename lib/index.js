/*
 * floox
 * https://github.com/fatfisz/floox
 *
 * Copyright (c) 2015 FatFisz
 * Licensed under the MIT license.
 */

'use strict';

var Dispatcher = require('flux').Dispatcher;

var createAction = require('./create_action');
var createMixin = require('./create_mixin');
var createStore = require('./create_store');
var dispatch = require('./dispatch');


module.exports = function createFloox() {
  var dispatcher = new Dispatcher();

  var internals = {
    dispatcher: dispatcher,
    dispatch: dispatch.bind(null, dispatcher),
    stores: {},
    storesByName: {},
    dispatchTokens: {},
    dispatcherActions: {},
    actions: {},
  };

  var mixin = createMixin(internals);

  return {
    stores: internals.stores,
    actions: internals.actions,
    createStore: createStore.bind(null, internals),
    createAction: createAction.bind(null, internals),
    StateFromStoreMixin: mixin,
  };
};
