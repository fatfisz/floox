'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

var babelHelpers = {};

babelHelpers.createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

babelHelpers.objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

babelHelpers._extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
function cleanup(data) {
  // Clone callbacks, as they might contain calls to `setState`
  var callbacks = [].concat(data.callbacks);

  data.isSetting = false;
  data.partialStates.length = 0;
  data.callbacks.length = 0;

  callbacks.forEach(function (callback) {
    callback();
  });
}

function listenersCallback(data) {
  data.listenersLeft -= 1;
  if (data.listenersLeft !== 0) {
    return;
  }

  cleanup(data);
}

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
    cleanup(data);
    return;
  }

  // Guard against synchronous listeners calling "cleanup" too early
  data.listenersLeft = 1;
  listeners.forEach(function (listener) {
    data.listenersLeft += 1;
    listener(function () {
      listenersCallback(data);
    });
  });
  // The "last listener":
  listenersCallback(data);
}

function defaultCombineState(currentState, partialState) {
  if (typeof partialState === 'function') {
    return partialState(currentState);
  }

  if (typeof currentState !== 'object' || typeof partialState !== 'object' || currentState === null) {
    return partialState;
  }

  return Object.assign(currentState, partialState);
}

var privateData = new WeakMap();

var Floox = (function () {
  function Floox(config) {
    babelHelpers.classCallCheck(this, Floox);

    if (process.env.NODE_ENV !== 'production' && !config) {
      throw new Error('The "config" argument is missing.');
    }

    var getInitialState = config.getInitialState;
    var _config$combineState = config.combineState;
    var combineState = _config$combineState === undefined ? defaultCombineState : _config$combineState;
    var rest = babelHelpers.objectWithoutProperties(config, ['getInitialState', 'combineState']);

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

    Object.assign(this, rest);
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
      applyChanges(data);
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
      applyChanges(data);
    }
  };

  Floox.prototype.addChangeListener = function addChangeListener(listener) {
    privateData.get(this).listeners.add(listener);
  };

  Floox.prototype.removeChangeListener = function removeChangeListener(listener) {
    privateData.get(this).listeners['delete'](listener);
  };

  babelHelpers.createClass(Floox, [{
    key: 'state',
    get: function get() {
      return privateData.get(this).state;
    }
  }]);
  return Floox;
})();

function getComponentName(Component) {
  if (typeof Component === 'string') {
    return Component;
  }

  return Component.displayName || Component.name || 'anonymous';
}

function getState(floox, mapping, keys, passFloox) {
  var state = floox.state;

  var result = {};

  keys.forEach(function (key) {
    var targetKey = mapping[key];
    result[key] = state[targetKey];
  });

  if (passFloox) {
    result.floox = floox;
  }

  return result;
}
function connectFloox(Component, mapping) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  if (process.env.NODE_ENV !== 'production' && typeof Component !== 'function' && typeof Component !== 'string') {
    // eslint-disable-next-line no-console
    throw new Error('Expected Component to be a string (for built-in components) or a class/function (for composite components).');
  }

  if (process.env.NODE_ENV !== 'production' && (typeof mapping !== 'object' || mapping === null)) {
    // eslint-disable-next-line no-console
    throw new Error('Expected mapping to be an object.');
  }

  var shouldComponentUpdate = options.shouldComponentUpdate;

  if (process.env.NODE_ENV !== 'production' && typeof shouldComponentUpdate !== 'undefined' && typeof shouldComponentUpdate !== 'function') {
    throw new Error('Expected `shouldComponentUpdate` to be a function.');
  }

  var componentName = getComponentName(Component);
  var keys = Object.keys(mapping);

  keys.forEach(function (key) {
    var targetKey = mapping[key];

    if (targetKey === true) {
      mapping[key] = key;
      return;
    }

    if (process.env.NODE_ENV !== 'production' && typeof targetKey !== 'string') {
      // eslint-disable-next-line no-console
      console.error('Warning: The value of the ' + key + ' property should be either "true" or a string, got ' + targetKey + '.');
    }
  });

  var flooxKeyIndex = keys.indexOf('floox');
  var passFloox = flooxKeyIndex !== -1;

  if (passFloox) {
    keys.splice(flooxKeyIndex, 1);
  }

  return React.createClass({
    displayName: 'FlooxConnector<' + componentName + '>',

    contextTypes: {
      floox: React.PropTypes.instanceOf(Floox).isRequired
    },

    getInitialState: function getInitialState() {
      return getState(this.context.floox, mapping, keys, passFloox);
    },

    componentDidMount: function componentDidMount() {
      this.context.floox.addChangeListener(this.flooxUpdate);
    },

    shouldComponentUpdate: shouldComponentUpdate,

    componentWillUnmount: function componentWillUnmount() {
      this.context.floox.removeChangeListener(this.flooxUpdate);
      this.callbackAndCleanup();
    },

    render: function render() {
      return React.createElement(Component, babelHelpers._extends({}, this.props, this.state));
    },

    flooxUpdate: function flooxUpdate(callback) {
      if (process.env.NODE_ENV !== 'production' && this.callback) {
        throw new Error('The listener was called twice in one update cycle. This shouldn\'t happen.');
      }

      var nextState = getState(this.context.floox, mapping, keys, passFloox);

      this.callback = callback;
      this.setState(nextState, this.callbackAndCleanup);
    },

    callbackAndCleanup: function callbackAndCleanup() {
      var callback = this.callback;

      if (callback) {
        this.callback = null;
        callback();
      }
    }
  });
}

var FlooxProvider = React.createClass({
  displayName: 'FlooxProvider',

  propTypes: {
    children: React.PropTypes.element.isRequired,
    floox: React.PropTypes.instanceOf(Floox).isRequired
  },

  childContextTypes: {
    floox: React.PropTypes.instanceOf(Floox).isRequired
  },

  getChildContext: function getChildContext() {
    return {
      floox: this.props.floox
    };
  },

  render: function render() {
    return React.Children.only(this.props.children);
  }
});

exports.connectFloox = connectFloox;
exports.Floox = Floox;
exports.FlooxProvider = FlooxProvider;