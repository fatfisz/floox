import setupStore from './setup_store';


export default function createStore(internals, store) {
  setupStore(store, internals);

  internals.store = store;

  return store;
}
