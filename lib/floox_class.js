import applyChanges from './apply_changes';
import defaultCombineState from './default_combine_state';


const privateData = new WeakMap();

export default class Floox {
  constructor(config) {
    if (process.env.NODE_ENV !== 'production' && !config) {
      throw new Error('The "config" argument is missing.');
    }

    const {
      getInitialState,
      combineState = defaultCombineState,
      ...rest,
    } = config;

    if (process.env.NODE_ENV !== 'production' && !getInitialState) {
      throw new Error('The config is missing the "getInitialState" method.');
    }

    privateData.set(this, {
      state: getInitialState(),
      combineState,
      listeners: new Set(),
      listenersLeft: 0,
      batchCount: 0,
      isSetting: false,
      partialStates: [],
      callbacks: [],
    });

    Object.assign(this, rest);
  }

  get state() {
    return privateData.get(this).state;
  }

  setState(partialState, callback) {
    const data = privateData.get(this);

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
  }

  batch(changes, callback) {
    const data = privateData.get(this);

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
  }

  addChangeListener(listener) {
    privateData.get(this).listeners.add(listener);
  }

  removeChangeListener(listener) {
    privateData.get(this).listeners.delete(listener);
  }
}
