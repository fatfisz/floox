'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = createMixin;
var defaultComponentName = '<anonymous>';

function getPropertyGetter(store, propertyName, key) {
  return function getPropertyValue(storeState) {
    storeState[key] = store[propertyName];
    return storeState;
  };
}

function getMethodGetter(store, propertyName, key) {
  return function getMethodResult(storeState) {
    storeState[key] = store[propertyName]();
    return storeState;
  };
}

function addStoreProperty(mapping, store, storeName, propertyName, key) {
  if (process.env.NODE_ENV !== 'production' && !store.hasOwnProperty(propertyName)) {
    throw new Error('[' + this._floox.componentName + '] Store "' + storeName + '" doesn\'t have "' + propertyName + '" property');
  }

  if (typeof store[propertyName] === 'function') {
    mapping.push(getMethodGetter(store, propertyName, key));
  } else {
    mapping.push(getPropertyGetter(store, propertyName, key));
  }
}

function getProcessedStoreStateMapping() {
  var _this = this;

  var storeStateMapping = this.getStoreStateMapping();
  var processedStoreStateMapping = {};

  Object.keys(storeStateMapping).forEach(function (storeName) {
    var props = storeStateMapping[storeName];
    var isObject = typeof props === 'object' && props !== null;
    var isArray = Array.isArray(props);

    if (process.env.NODE_ENV !== 'production') {
      if (!isArray && !isObject) {
        // root-level property that is not an array
        throw new Error('[' + _this._floox.componentName + '] Expected "' + storeName + '" property to be an array or an object');
      }

      if (!_this._floox.storesByName.hasOwnProperty(storeName)) {
        throw new Error('[' + _this._floox.componentName + '] Store "' + storeName + '" doesn\'t exist');
      }
    }

    var mapping = [];
    var store = _this._floox.storesByName[storeName];

    processedStoreStateMapping[storeName] = mapping;

    if (isArray) {
      props.forEach(function (name) {
        addStoreProperty.call(_this, mapping, store, storeName, name, name);
      });
    } else {
      Object.keys(props).forEach(function (key) {
        addStoreProperty.call(_this, mapping, store, storeName, props[key], key);
      });
    }
  });

  return processedStoreStateMapping;
}

function init(storesByName) {
  this._floox = {
    storesByName: storesByName
  };

  if (process.env.NODE_ENV !== 'production') {
    this._floox.componentName = this.constructor.displayName || defaultComponentName;

    if (!this.hasOwnProperty('getStoreStateMapping')) {
      throw new Error('Component "' + this._floox.componentName + '" should have a "getStoreStateMapping" method');
    }
  }

  this._floox.storeStateMapping = getProcessedStoreStateMapping.call(this);
  this._floox.mappedStoreNames = Object.keys(this._floox.storeStateMapping);
}

function getStateFromStore(stores, storeName) {
  var mapping = this._floox.storeStateMapping[storeName];
  var storeState = mapping.reduce(function (acc, getter) {
    return getter(acc);
  }, {});

  stores[storeName] = storeState;

  return stores;
}

function getStateFromStores(changedStore, previousState, currentProps) {
  var partialNextState = undefined;

  if (changedStore) {
    partialNextState = {
      stores: getStateFromStore.call(this, _extends({}, previousState.stores), changedStore)
    };

    if (this.storeStateWillUpdate) {
      this.storeStateWillUpdate(partialNextState, previousState, currentProps);
    }
  } else {
    partialNextState = {
      stores: this._floox.mappedStoreNames.reduce(getStateFromStore.bind(this), {})
    };
  }

  return partialNextState;
}

function updateState(changedStore) {
  this.setState(getStateFromStores.bind(this, changedStore));
}

function getListenerConnector(method) {
  return function listenerConnector() {
    var _this2 = this;

    if (process.env.NODE_ENV !== 'production') {
      if (method === 'on' && this._floox.listenerByName) {
        throw new Error('Tried to attach listeners twice on component "' + this._floox.componentName + '"');
      }
      if (method === 'off' && !this._floox.listenerByName) {
        throw new Error('Tried to detach listeners twice on component "' + this._floox.componentName + '"');
      }
    }

    if (method === 'on') {
      this._floox.listenerByName = {};

      this._floox.mappedStoreNames.forEach(function (storeName) {
        _this2._floox.listenerByName[storeName] = updateState.bind(_this2, storeName);
      });
    }

    this._floox.mappedStoreNames.forEach(function (storeName) {
      _this2._floox.storesByName[storeName][method]('change', _this2._floox.listenerByName[storeName]);
    });

    if (method === 'off') {
      this._floox.listenerByName = null;
    }
  };
}

function createMixin(internals) {
  return {
    getInitialState: function getInitialState() {
      init.call(this, internals.storesByName);
      return getStateFromStores.call(this);
    },
    componentDidMount: getListenerConnector('on'),
    componentWillUnmount: getListenerConnector('off')
  };
}

module.exports = exports['default'];
