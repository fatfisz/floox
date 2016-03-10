'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createMixin;
var defaultComponentName = '<anonymous>';

function getPropertyGetter(store, propertyName, key) {
  if (process.env.NODE_ENV !== 'production' && !store.hasOwnProperty(propertyName)) {
    throw new Error('[' + this._floox.componentName + '] Unknown store property "' + propertyName + '"');
  }

  if (typeof store[propertyName] === 'function') {
    return function (storeState) {
      storeState[key] = store[propertyName]();
      return storeState;
    };
  }

  return function (storeState) {
    storeState[key] = store[propertyName];
    return storeState;
  };
}

function getProcessedStoreStateMapping() {
  var _this = this;

  var props = this.getStoreStateMapping();
  var store = this._floox.store;

  if (Array.isArray(props)) {
    return props.map(function (name, index) {
      if (process.env.NODE_ENV !== 'production' && typeof name !== 'string') {
        throw new Error('[' + _this._floox.componentName + '] Expected the mapping value at index ' + index + ' to be a string');
      }

      return getPropertyGetter.call(_this, store, name, name);
    });
  }

  if (typeof props === 'object' && props !== null) {
    return Object.keys(props).map(function (key) {
      var value = props[key];
      if (process.env.NODE_ENV !== 'production' && typeof value !== 'string') {
        throw new Error('[' + _this._floox.componentName + '] Expected the "' + key + '" property to be a string');
      }

      return getPropertyGetter.call(_this, store, value, key);
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    throw new Error('[' + this._floox.componentName + '] Expected the store state mapping to be an array or an object');
  }
}

function init(store) {
  this._floox = {
    store: store
  };

  if (process.env.NODE_ENV !== 'production') {
    this._floox.componentName = this.constructor.displayName || defaultComponentName;

    if (!this.hasOwnProperty('getStoreStateMapping')) {
      throw new Error('Component "' + this._floox.componentName + '" should have a "getStoreStateMapping" method');
    }
  }

  this._floox.storeStateMapping = getProcessedStoreStateMapping.call(this);
}

function getStateFromStores(previousState, currentProps) {
  var partialNextState = {
    store: this._floox.storeStateMapping.reduce(function (acc, getter) {
      return getter(acc);
    }, {})
  };

  if (this._floox.ignoreFirst) {
    this._floox.ignoreFirst = false;
  } else if (this.storeStateWillUpdate) {
    this.storeStateWillUpdate(partialNextState, previousState, currentProps);
  }

  return partialNextState;
}

function getListenerConnector(method) {
  return function listenerConnector() {
    var _this2 = this;

    if (process.env.NODE_ENV !== 'production') {
      if (method === 'on' && this._floox.listener) {
        throw new Error('Tried to attach listeners twice on component "' + this._floox.componentName + '"');
      }
      if (method === 'off' && !this._floox.listener) {
        throw new Error('Tried to detach listeners twice on component "' + this._floox.componentName + '"');
      }
    }

    if (method === 'on') {
      this._floox.listener = function () {
        return _this2.setState(getStateFromStores.bind(_this2));
      };
    }

    this._floox.store[method]('change', this._floox.listener);

    if (method === 'off') {
      this._floox.listener = null;
    }
  };
}

function createMixin(internals) {
  return {
    getInitialState: function getInitialState() {
      init.call(this, internals.store);
      this._floox.ignoreFirst = true;
      return getStateFromStores.call(this);
    },
    componentDidMount: getListenerConnector('on'),
    componentWillUnmount: getListenerConnector('off')
  };
}

module.exports = exports['default'];
