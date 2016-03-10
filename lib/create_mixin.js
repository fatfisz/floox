const defaultComponentName = '<anonymous>';

function getPropertyGetter(store, propertyName, key) {
  if (process.env.NODE_ENV !== 'production' &&
      !store.hasOwnProperty(propertyName)) {
    throw new Error(
      `[${this._floox.componentName}] Unknown store property "${propertyName}"`
    );
  }

  if (typeof store[propertyName] === 'function') {
    return (storeState) => {
      storeState[key] = store[propertyName]();
      return storeState;
    };
  }

  return (storeState) => {
    storeState[key] = store[propertyName];
    return storeState;
  };
}

function getProcessedStoreStateMapping() {
  const props = this.getStoreStateMapping();
  const { store } = this._floox;

  if (Array.isArray(props)) {
    return props.map((name, index) => {
      if (process.env.NODE_ENV !== 'production' &&
          typeof name !== 'string') {
        throw new Error(
          `[${this._floox.componentName}] Expected the mapping value at index ${index} to be a string`
        );
      }

      return getPropertyGetter.call(this, store, name, name);
    });
  }

  if (typeof props === 'object' && props !== null) {
    return Object.keys(props).map((key) => {
      const value = props[key];
      if (process.env.NODE_ENV !== 'production' &&
          typeof value !== 'string') {
        throw new Error(
          `[${this._floox.componentName}] Expected the "${key}" property to be a string`
        );
      }

      return getPropertyGetter.call(this, store, value, key);
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(
      `[${this._floox.componentName}] Expected the store state mapping to be an array or an object`
    );
  }
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
      this._floox.listener = () => this.setState(getStateFromStores.bind(this));
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
