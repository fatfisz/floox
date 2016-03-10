'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = createMixin;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nsProps = require('ns-props');

var _nsProps2 = _interopRequireDefault(_nsProps);

var _for_each_nested_property = require('./for_each_nested_property');

var _for_each_nested_property2 = _interopRequireDefault(_for_each_nested_property);

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

  (0, _for_each_nested_property2['default'])(storeStateMapping, function (propertyName, value, key) {
    var isArray = Array.isArray(value);
    var storeName = propertyName;

    if (!isArray) {
      storeName = storeName.substring(0, storeName.lastIndexOf('.'));
    }

    if (process.env.NODE_ENV !== 'production') {
      if (propertyName === key && !isArray) {
        // root-level property that is not an array
        throw new Error('[' + _this._floox.componentName + '] Expected "' + propertyName + '" property to be an array or an object');
      }

      if (!isArray && typeof value !== 'string') {
        throw new Error('[' + _this._floox.componentName + '] Expected "' + propertyName + '" property to be an array, an object, or a string');
      }

      if (!_this._floox.storesByName.hasOwnProperty(storeName)) {
        throw new Error('[' + _this._floox.componentName + '] Store "' + storeName + '" doesn\'t exist');
      }
    }

    if (!processedStoreStateMapping[storeName]) {
      processedStoreStateMapping[storeName] = [];
    }

    var mapping = processedStoreStateMapping[storeName];
    var store = _this._floox.storesByName[storeName];

    if (isArray) {
      value.forEach(function (name) {
        addStoreProperty.call(_this, mapping, store, storeName, name, name);
      });
    } else {
      addStoreProperty.call(_this, mapping, store, storeName, value, key);
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

  _nsProps2['default'].set(stores, storeName, storeState);

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
