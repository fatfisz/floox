import React from 'react';

import Floox from './floox_class';


function getComponentName(Component) {
  if (typeof Component === 'string') {
    return Component;
  }

  return Component.displayName || Component.name || 'anonymous';
}

function getState(floox, mapping, keys, passFloox) {
  const { state } = floox;
  const result = {};

  keys.forEach((key) => {
    const targetKey = mapping[key];
    result[key] = state[targetKey];
  });

  if (passFloox) {
    result.floox = floox;
  }

  return result;
}

export default function connectFloox(Component, mapping) {
  if (process.env.NODE_ENV !== 'production' &&
      typeof Component !== 'function' && typeof Component !== 'string') {
    // eslint-disable-next-line no-console
    throw new Error('Expected Component to be a string (for built-in components) or a class/function (for composite components).');
  }

  if (process.env.NODE_ENV !== 'production' &&
      (typeof mapping !== 'object' || mapping === null)) {
    // eslint-disable-next-line no-console
    throw new Error('Expected mapping to be an object.');
  }

  const componentName = getComponentName(Component);
  const keys = Object.keys(mapping);

  keys.forEach((key) => {
    const targetKey = mapping[key];

    if (targetKey === true) {
      mapping[key] = key;
      return;
    }

    if (process.env.NODE_ENV !== 'production' && typeof targetKey !== 'string') {
      // eslint-disable-next-line no-console
      console.error(`Warning: The value of the ${key} property should be either "true" or a string, got ${targetKey}.`);
    }
  });

  const flooxKeyIndex = keys.indexOf('floox');
  const passFloox = flooxKeyIndex !== -1;

  if (passFloox) {
    keys.splice(flooxKeyIndex, 1);
  }

  return React.createClass({
    displayName: `FlooxConnector<${componentName}>`,

    contextTypes: {
      floox: React.PropTypes.instanceOf(Floox).isRequired,
    },

    getInitialState() {
      return getState(this.context.floox, mapping, keys, passFloox);
    },

    componentDidMount() {
      this.context.floox.addChangeListener(this.flooxUpdate);
    },

    componentWillUnmount() {
      this.context.floox.removeChangeListener(this.flooxUpdate);
      this.callbackAndCleanup();
    },

    render() {
      return React.createElement(Component, {
        ...this.props,
        ...this.state,
      });
    },

    flooxUpdate(callback) {
      if (process.env.NODE_ENV !== 'production' && this.callback) {
        throw new Error('The listener was called twice in one update cycle. This shouldn\'t happen.');
      }

      const nextState = getState(this.context.floox, mapping, keys, passFloox);

      this.callback = callback;
      this.setState(nextState, this.callbackAndCleanup);
    },

    callbackAndCleanup() {
      const { callback } = this;

      if (callback) {
        this.callback = null;
        callback();
      }
    },
  });
}
