import React from 'react';

import Floox from './floox_class';


const FlooxProvider = React.createClass({
  propTypes: {
    config: React.PropTypes.shape({
      getInitialState: React.PropTypes.func.isRequired,
    }).isRequired,
  },

  childContextTypes: {
    floox: React.PropTypes.object.isRequired,
  },

  componentWillMount() {
    // Compute once before mounting.
    this.floox = new Floox(this.props.config);
  },

  getChildContext() {
    return {
      floox: this.floox,
    };
  },

  render() {
    return React.Children.only(this.props.children);
  },
});

export default FlooxProvider;
