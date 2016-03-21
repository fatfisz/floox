'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _default_combine_state = require('./default_combine_state');

var _default_combine_state2 = _interopRequireDefault(_default_combine_state);

var privateData = new WeakMap();

function listenersCallback() {
  var data = privateData.get(this);

  data.listenersLeft -= 1;
  if (data.listenersLeft !== 0) {
    return;
  }

  data.isSetting = false;

  if (data.currentCallback) {
    data.currentCallback();
  }
}

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
      isSetting: false,
      listenersLeft: 0,
      currentCallback: null,
      listenersCallback: listenersCallback.bind(this)
    });

    Object.assign(this, rest);
  }

  Floox.prototype.setState = function setState(partialState, callback) {
    var data = privateData.get(this);

    if (data.isSetting) {
      throw new Error('Cannot change Floox state in the middle of state propagation.');
    }

    data.state = data.combineState(data.state, partialState);

    var listenersLeft = data.listeners.size;

    if (listenersLeft === 0) {
      if (callback) {
        callback();
      }
      return;
    }

    data.isSetting = true;
    data.listenersLeft = listenersLeft;
    data.currentCallback = callback;

    data.listeners.forEach(function (listener) {
      listener(data.listenersCallback);
    });
  };

  Floox.prototype.addChangeListener = function addChangeListener(listener) {
    var data = privateData.get(this);

    if (data.isSetting) {
      throw new Error('Cannot add listeners in the middle of state propagation.');
    }

    data.listeners.add(listener);
  };

  Floox.prototype.removeChangeListener = function removeChangeListener(listener) {
    var data = privateData.get(this);

    if (data.isSetting) {
      throw new Error('Cannot remove listeners in the middle of state propagation.');
    }

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
