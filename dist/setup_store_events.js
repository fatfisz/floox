'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports['default'] = setupStoreEvents;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var defaultEvents = ['change'];

var EventEmitter = (function () {
  function EventEmitter(events) {
    _classCallCheck(this, EventEmitter);

    if (process.env.NODE_ENV !== 'production' && !Array.isArray(events) || !events.length) {
      throw new Error('Expected a non-empty array');
    }

    this.events = events.reduce(function (acc, event) {
      acc['event_' + event] = [];
      return acc;
    }, {});
  }

  _createClass(EventEmitter, [{
    key: 'getHandlers',
    value: function getHandlers(event) {
      var handlers = this.events['event_' + event];

      if (process.env.NODE_ENV !== 'production' && !handlers) {
        throw new Error('Unknown event "' + event + '"');
      }

      return handlers;
    }
  }, {
    key: 'emit',
    value: function emit(event) {
      [].concat(this.getHandlers(event)).forEach(function (handler) {
        return handler();
      });
    }
  }, {
    key: 'on',
    value: function on(event, handler) {
      var handlers = this.getHandlers(event);

      if (handlers.indexOf(handler) === -1) {
        handlers.push(handler);
      }
    }
  }, {
    key: 'off',
    value: function off(event, handler) {
      var handlers = this.getHandlers(event);
      var index = handlers.indexOf(handler);
      var length = handlers.length;

      if (index !== -1) {
        if (index !== length - 1) {
          handlers[index] = handlers[length - 1];
        }

        handlers.pop();
      }
    }
  }]);

  return EventEmitter;
})();

function setupStoreEvents(store) {
  var events = store.hasOwnProperty('events') ? store.events : defaultEvents;
  var eventEmitter = new EventEmitter(events);

  store.emit = eventEmitter.emit.bind(eventEmitter);
  store.on = eventEmitter.on.bind(eventEmitter);
  store.off = eventEmitter.off.bind(eventEmitter);
}

module.exports = exports['default'];
