'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _apply_changes = require('./apply_changes');

var _apply_changes2 = _interopRequireDefault(_apply_changes);

var _default_combine_state = require('./default_combine_state');

var _default_combine_state2 = _interopRequireDefault(_default_combine_state);

var privateData = new WeakMap();

var Floox = (function () {
  function Floox(config) {
    _classCallCheck(this, Floox);

    if (process.env.NODE_ENV !== 'production' && !config) {
      throw new Error('The "config" argument is missing.');
    }

    var getInitialState = config.getInitialState;
    var _config$combineState = config.combineState;
    var combineState = _config$combineState === undefined ? _default_combine_state2['default'] : _config$combineState;

    var rest = _objectWithoutProperties(config, ['getInitialState', 'combineState']);

    if (process.env.NODE_ENV !== 'production' && !getInitialState) {
      throw new Error('The config is missing the "getInitialState" method.');
    }

    privateData.set(this, {
      state: getInitialState(),
      combineState: combineState,
      listeners: new Set(),
      listenersLeft: 0,
      batchCount: 0,
      isSetting: false,
      partialStates: [],
      callbacks: []
    });

    _extends(this, rest);
  }

  Floox.prototype.setState = function setState(partialState, callback) {
    var data = privateData.get(this);

    if (process.env.NODE_ENV !== 'production' && data.isSetting) {
      throw new Error('Cannot change Floox state in the middle of state propagation.');
    }

    data.partialStates.push(partialState);
    if (callback) {
      data.callbacks.push(callback);
    }

    if (data.batchCount === 0) {
      (0, _apply_changes2['default'])(data);
    }
  };

  Floox.prototype.batch = function batch(changes, callback) {
    var data = privateData.get(this);

    if (process.env.NODE_ENV !== 'production' && typeof changes !== 'function') {
      throw new Error('Expected the first argument to be a function.');
    }

    if (process.env.NODE_ENV !== 'production' && data.isSetting) {
      throw new Error('Cannot change Floox state in the middle of state propagation.');
    }

    data.batchCount += 1;
    changes();
    data.batchCount -= 1;
    if (callback) {
      data.callbacks.push(callback);
    }

    if (data.batchCount === 0) {
      (0, _apply_changes2['default'])(data);
    }
  };

  Floox.prototype.addChangeListener = function addChangeListener(listener) {
    privateData.get(this).listeners.add(listener);
  };

  Floox.prototype.removeChangeListener = function removeChangeListener(listener) {
    privateData.get(this).listeners['delete'](listener);
  };

  _createClass(Floox, [{
    key: 'state',
    get: function get() {
      return privateData.get(this).state;
    }
  }]);

  return Floox;
})();

exports['default'] = Floox;
module.exports = exports['default'];
