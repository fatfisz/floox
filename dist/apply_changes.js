'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = applyChanges;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cleanup = require('./cleanup');

var _cleanup2 = _interopRequireDefault(_cleanup);

var _listeners_callback = require('./listeners_callback');

var _listeners_callback2 = _interopRequireDefault(_listeners_callback);

function applyChanges(data) {
  var combineState = data.combineState;
  var listeners = data.listeners;
  var state = data.state;

  data.isSetting = true;
  data.partialStates.forEach(function (partialState) {
    state = combineState(state, partialState);
  });
  data.state = state;

  if (listeners.size === 0) {
    (0, _cleanup2['default'])(data);
    return;
  }

  // Guard against synchronous listeners calling "cleanup" too early
  data.listenersLeft = 1;
  listeners.forEach(function (listener) {
    data.listenersLeft += 1;
    listener(function () {
      (0, _listeners_callback2['default'])(data);
    });
  });
  // The "last listener":
  (0, _listeners_callback2['default'])(data);
}

module.exports = exports['default'];
