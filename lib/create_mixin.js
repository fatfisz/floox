import nsProps from 'ns-props';

import forEachNestedProperty from './for_each_nested_property';


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

function addStoreProperty(mapping, store, storeName, propertyName, key) {
  if (process.env.NODE_ENV !== 'production' &&
      !store.hasOwnProperty(propertyName)) {
    throw new Error(
      `[${this._floox.componentName}] Store "${storeName}" doesn't have "${propertyName}" property`
    );
  }

  if (typeof store[propertyName] === 'function') {
    mapping.push(getMethodGetter(store, propertyName, key));
  } else {
    mapping.push(getPropertyGetter(store, propertyName, key));
  }
}

function getProcessedStoreStateMapping() {
  const storeStateMapping = this.getStoreStateMapping();
  const processedStoreStateMapping = {};

  forEachNestedProperty(storeStateMapping, (propertyName, value, key) => {
    const isArray = Array.isArray(value);
    let storeName = propertyName;

    if (!isArray) {
      storeName = storeName.substring(0, storeName.lastIndexOf('.'));
    }

    if (process.env.NODE_ENV !== 'production') {
      if (propertyName === key && !isArray) {
        // root-level property that is not an array
        throw new Error(
          `[${this._floox.componentName}] Expected "${propertyName}" property to be an array or an object`
        );
      }

      if (!isArray && typeof value !== 'string') {
        throw new Error(
          `[${this._floox.componentName}] Expected "${propertyName}" property to be an array, an object, or a string`
        );
      }

      if (!this._floox.storesByName.hasOwnProperty(storeName)) {
        throw new Error(
          `[${this._floox.componentName}] Store "${storeName}" doesn\'t exist`
        );
      }
    }

    if (!processedStoreStateMapping[storeName]) {
      processedStoreStateMapping[storeName] = [];
    }

    const mapping = processedStoreStateMapping[storeName];
    const store = this._floox.storesByName[storeName];

    if (isArray) {
      value.forEach((name) => {
        addStoreProperty.call(this, mapping, store, storeName, name, name);
      });
    } else {
      addStoreProperty.call(this, mapping, store, storeName, value, key);
    }
  });

  return processedStoreStateMapping;
}

function init(storesByName) {
  this._floox = {
    storesByName,
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
  this._floox.mappedStoreNames = Object.keys(this._floox.storeStateMapping);
}

function getStateFromStore(stores, storeName) {
  const mapping = this._floox.storeStateMapping[storeName];
  const storeState = mapping.reduce((acc, getter) => getter(acc), {});

  nsProps.set(stores, storeName, storeState);

  return stores;
}

function getStateFromStores(changedStore, previousState, currentProps) {
  let partialNextState;

  if (changedStore) {
    partialNextState = {
      stores: getStateFromStore.call(
        this,
        { ...previousState.stores },
        changedStore
      ),
    };

    if (this.storeStateWillUpdate) {
      this.storeStateWillUpdate(partialNextState, previousState, currentProps);
    }
  } else {
    partialNextState = {
      stores: this._floox.mappedStoreNames.reduce(
        getStateFromStore.bind(this), {}
      ),
    };
  }

  return partialNextState;
}

function updateState(changedStore) {
  this.setState(getStateFromStores.bind(this, changedStore));
}

function getListenerConnector(method) {
  return function listenerConnector() {
    if (process.env.NODE_ENV !== 'production') {
      if (method === 'on' && this._floox.listenerByName) {
        throw new Error(
          `Tried to attach listeners twice on component "${this._floox.componentName}"`
        );
      }
      if (method === 'off' && !this._floox.listenerByName) {
        throw new Error(
          `Tried to detach listeners twice on component "${this._floox.componentName}"`
        );
      }
    }

    if (method === 'on') {
      this._floox.listenerByName = {};

      this._floox.mappedStoreNames.forEach((storeName) => {
        this._floox.listenerByName[storeName] =
          updateState.bind(this, storeName);
      });
    }

    this._floox.mappedStoreNames.forEach((storeName) => {
      this._floox.storesByName[storeName][method](
        'change',
        this._floox.listenerByName[storeName]
      );
    });

    if (method === 'off') {
      this._floox.listenerByName = null;
    }
  };
}

export default function createMixin(internals) {
  return {
    getInitialState() {
      init.call(this, internals.storesByName);
      return getStateFromStores.call(this);
    },
    componentDidMount: getListenerConnector('on'),
    componentWillUnmount: getListenerConnector('off'),
  };
}
