'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = setupStoreEvents;

var _events = require('events');

var defaultEvents = ['change'];

function setupStoreEvents(store) {
  var eventEmitter = new _events.EventEmitter();

  var events = store.hasOwnProperty('events') ? store.events : defaultEvents;

  if (process.env.NODE_ENV !== 'production' && !Array.isArray(events) || !events.length) {
    throw new Error('The "events" property should be a non-empty array');
  }

  if (store.hasOwnProperty('maxListeners')) {
    eventEmitter.setMaxListeners(store.maxListeners);
  }

  store.emit = function (event) {
    if (process.env.NODE_ENV !== 'production' && events.indexOf(event) === -1) {
      throw new Error('Unknown event "' + event + '"');
    }

    eventEmitter.emit(event);
  };

  store.on = function (event, handler) {
    if (process.env.NODE_ENV !== 'production' && events.indexOf(event) === -1) {
      throw new Error('Unknown event "' + event + '"');
    }

    eventEmitter.on(event, handler);
  };

  store.off = function (event, handler) {
    if (process.env.NODE_ENV !== 'production' && events.indexOf(event) === -1) {
      throw new Error('Unknown event "' + event + '"');
    }

    eventEmitter.removeListener(event, handler);
  };
}

module.exports = exports['default'];
