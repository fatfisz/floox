import setupStore from './setup_store';


export default function createStore(internals, _name, store) {
  const name = 'floox';
  const stores = internals.stores;
  const storesByName = internals.storesByName;
  const dispatchTokens = internals.dispatchTokens;

  if (process.env.NODE_ENV !== 'production' &&
      storesByName.hasOwnProperty(name)) {
    throw new Error('Can\'t create the store twice');
  }

  const dispatchToken = setupStore(store, name, internals);

  stores[name] = store;
  storesByName[name] = store;
  dispatchTokens[name] = dispatchToken;

  return store;
}
