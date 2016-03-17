import React from 'react';


const FlooxConnector = React.createClass({
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
    const { children, ...props } = this.props;
    const { state } = floox;
    const element = React.Children.only(children);

    Object.keys(props).forEach((key) => {
      const value = props[key];

      if (value === true) {
        props[key] = state[key];
        return;
      }

      if (process.env.NODE_ENV !== 'production' && typeof value !== 'string') {
        // eslint-disable-next-line no-console
        console.error(`Warning: The value of the ${key} prop should be "true" or a string.`);
      }

      props[key] = state[value];
    });

    props.floox = floox;

    return React.cloneElement(element, props);
  },

  flooxUpdate(callback) {
    this.forceUpdate(callback);
  },
});

export default FlooxConnector;
