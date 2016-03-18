import defaultCombineState from './default_combine_state';


const privateData = new WeakMap();

function listenersCallback() {
  const data = privateData.get(this);

  data.listenersLeft -= 1;
  if (data.listenersLeft !== 0) {
    return;
  }

  data.isSetting = false;

  if (data.currentCallback) {
    data.currentCallback();
  }
}

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
      isSetting: false,
      listenersLeft: 0,
      currentCallback: null,
      listenersCallback: listenersCallback.bind(this),
    });

    Object.assign(this, rest);
  }

  get state() {
    return privateData.get(this).state;
  }

  setState(partialState, callback) {
    const data = privateData.get(this);

    if (data.isSetting) {
      throw new Error('Cannot change Floox state in the middle of state propagation.');
    }

    data.state = data.combineState(data.state, partialState);

    const listenersLeft = data.listeners.size;

    if (listenersLeft === 0) {
      if (callback) {
        callback();
      }
      return;
    }

    data.isSetting = true;
    data.listenersLeft = listenersLeft;
    data.currentCallback = callback;

    data.listeners.forEach((listener) => {
      listener(data.listenersCallback);
    });
  }

  addChangeListener(listener) {
    const data = privateData.get(this);

    if (data.isSetting) {
      throw new Error('Cannot add listeners in the middle of state propagation.');
    }

    data.listeners.add(listener);
  }

  removeChangeListener(listener) {
    const data = privateData.get(this);

    if (data.isSetting) {
      throw new Error('Cannot remove listeners in the middle of state propagation.');
    }

    privateData.get(this).listeners.delete(listener);
  }
}
