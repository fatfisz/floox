'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = listenersCallback;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cleanup = require('./cleanup');

var _cleanup2 = _interopRequireDefault(_cleanup);

function listenersCallback(data) {
  data.listenersLeft -= 1;
  if (data.listenersLeft !== 0) {
    return;
  }

  (0, _cleanup2['default'])(data);
}

module.exports = exports['default'];
