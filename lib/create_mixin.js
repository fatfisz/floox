const defaultComponentName = '<anonymous>';

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

function addStoreProperty(mapping, store, propertyName, key) {
  if (process.env.NODE_ENV !== 'production' &&
      !store.hasOwnProperty(propertyName)) {
    throw new Error(
      `[${this._floox.componentName}] Unknown store property "${propertyName}"`
    );
  }

  if (typeof store[propertyName] === 'function') {
    mapping.push(getMethodGetter(store, propertyName, key));
  } else {
    mapping.push(getPropertyGetter(store, propertyName, key));
  }
}

function getProcessedStoreStateMapping() {
  const props = this.getStoreStateMapping();
  const isObject = typeof props === 'object' && props !== null;
  const isArray = Array.isArray(props);

  if (process.env.NODE_ENV !== 'production') {
    if (!isArray && !isObject) {
      // root-level property that is not an array
      throw new Error(
        `[${this._floox.componentName}] Expected the store state mapping to be an array or an object`
      );
    }
  }

  const mapping = [];
  const { store } = this._floox;

  if (isArray) {
    props.forEach((name) => {
      addStoreProperty.call(this, mapping, store, name, name);
    });
  } else {
    Object.keys(props).forEach((key) => {
      const value = props[key];
      if (process.env.NODE_ENV !== 'production' &&
          typeof value !== 'string') {
        throw new Error(
          `[${this._floox.componentName}] Expected the "${key}" property to be a string`
        );
      }
      addStoreProperty.call(this, mapping, store, value, key);
    });
  }

  return mapping;
}

function init(store) {
  this._floox = {
    store,
  };

  if (process.env.NODE_ENV !== 'production') {
    this._floox.componentName =
      this.constructor.displayName || defaultComponentName;

    if (!this.hasOwnProperty('getStoreStateMapping')) {
      throw new Error(
        `Component "${this._floox.componentName}" should have a "getStoreStateMapping" method`
      );
    }
  }

  this._floox.storeStateMapping = getProcessedStoreStateMapping.call(this);
}

function getStateFromStores(previousState, currentProps) {
  const partialNextState = {
    store: this._floox.storeStateMapping.reduce((acc, getter) => getter(acc), {}),
  };

  if (this._floox.ignoreFirst) {
    this._floox.ignoreFirst = false;
  } else if (this.storeStateWillUpdate) {
    this.storeStateWillUpdate(partialNextState, previousState, currentProps);
  }

  return partialNextState;
}

function updateState() {
  this.setState(getStateFromStores.bind(this));
}

function getListenerConnector(method) {
  return function listenerConnector() {
    if (process.env.NODE_ENV !== 'production') {
      if (method === 'on' && this._floox.listener) {
        throw new Error(
          `Tried to attach listeners twice on component "${this._floox.componentName}"`
        );
      }
      if (method === 'off' && !this._floox.listener) {
        throw new Error(
          `Tried to detach listeners twice on component "${this._floox.componentName}"`
        );
      }
    }

    if (method === 'on') {
      this._floox.listener = updateState.bind(this);
    }

    this._floox.store[method]('change', this._floox.listener);

    if (method === 'off') {
      this._floox.listener = null;
    }
  };
}

export default function createMixin(internals) {
  return {
    getInitialState() {
      init.call(this, internals.store);
      this._floox.ignoreFirst = true;
      return getStateFromStores.call(this);
    },
    componentDidMount: getListenerConnector('on'),
    componentWillUnmount: getListenerConnector('off'),
  };
}
