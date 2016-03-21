import React from 'react';


function getComponentName(Component) {
  if (typeof Component === 'string') {
    return Component;
  }

  return Component.displayName || Component.name || 'anonymous';
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
      floox: React.PropTypes.object.isRequired,
    },

    componentDidMount() {
      this.context.floox.addChangeListener(this.flooxUpdate);
    },

    componentWillUnmount() {
      this.context.floox.removeChangeListener(this.flooxUpdate);
    },

    render() {
      const { floox } = this.context;
      const { state } = floox;
      const { ...props } = this.props;

      keys.forEach((key) => {
        const targetKey = mapping[key];
        props[key] = state[targetKey];
      });

      if (passFloox) {
        props.floox = floox;
      }

      return React.createElement(Component, props);
    },

    flooxUpdate(callback) {
      this.forceUpdate(callback);
    },
  });
}
