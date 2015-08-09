/*
 * floox
 * https://github.com/fatfisz/floox
 *
 * Copyright (c) 2015 FatFisz
 * Licensed under the MIT license.
 */

'use strict';

var EventEmitter = require('events').EventEmitter;


var defaultEvents = ['change'];

module.exports = function setupStoreEvents(store, name) {
  var eventEmitter = new EventEmitter();

  var events = store.hasOwnProperty('events') ? store.events : defaultEvents;

  if (process.env.NODE_ENV !== 'production' &&
      !Array.isArray(events) || !events.length) {
    throw new Error(
      'The "events" property in store "' + name + '" should be a non-empty array'
    );
  }

  if (store.hasOwnProperty('maxListeners')) {
    eventEmitter.setMaxListeners(store.maxListeners);
  }

  store.emit = function (event) {
    if (process.env.NODE_ENV !== 'production' &&
        events.indexOf(event) === -1) {
      throw new Error(
        'Store "' + name + '" does not handle the event "' + event + '"'
      );
    }

    eventEmitter.emit(event);
  };

  store.on = function (event, handler) {
    if (process.env.NODE_ENV !== 'production' &&
        events.indexOf(event) === -1) {
      throw new Error(
        'Store "' + name + '" does not handle the event "' + event + '"'
      );
    }

    eventEmitter.on(event, handler);
  };

  store.off = function (event, handler) {
    if (process.env.NODE_ENV !== 'production' &&
        events.indexOf(event) === -1) {
      throw new Error(
        'Store "' + name + '" does not handle the event "' + event + '"'
      );
    }

    eventEmitter.removeListener(event, handler);
  };
};
