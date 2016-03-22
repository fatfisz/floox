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

  var listenersLeft = listeners.size;

  data.isSetting = true;

  var state = data.state;

  data.partialStates.forEach(function (partialState) {
    state = combineState(state, partialState);
  });
  data.state = state;

  if (listenersLeft === 0) {
    (0, _cleanup2['default'])(data);
    return;
  }

  data.listenersLeft = listenersLeft;
  listeners.forEach(function (listener) {
    listener(function () {
      (0, _listeners_callback2['default'])(data);
    });
  });
}

module.exports = exports['default'];
