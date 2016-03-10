import nsProps from 'ns-props';

import setupStore from './setup_store';


export default function createStore(internals, name, store) {
  const stores = internals.stores;
  const storesByName = internals.storesByName;
  const dispatchTokens = internals.dispatchTokens;

  if (process.env.NODE_ENV !== 'production' &&
      storesByName.hasOwnProperty(name)) {
    throw new Error(`Store "${name}" is already registered`);
  }

  const dispatchToken = setupStore(store, name, internals);

  nsProps.set(stores, name, store);
  storesByName[name] = store;
  dispatchTokens[name] = dispatchToken;

  return store;
}
