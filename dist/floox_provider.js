'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _floox_class = require('./floox_class');

var _floox_class2 = _interopRequireDefault(_floox_class);

var FlooxProvider = _react2['default'].createClass({
  displayName: 'FlooxProvider',

  propTypes: {
    config: _react2['default'].PropTypes.shape({
      getInitialState: _react2['default'].PropTypes.func.isRequired
    }).isRequired
  },

  childContextTypes: {
    floox: _react2['default'].PropTypes.object.isRequired
  },

  componentWillMount: function componentWillMount() {
    // Compute once before mounting.
    this.floox = new _floox_class2['default'](this.props.config);
  },

  getChildContext: function getChildContext() {
    return {
      floox: this.floox
    };
  },

  render: function render() {
    return _react2['default'].Children.only(this.props.children);
  }
});

exports['default'] = FlooxProvider;
module.exports = exports['default'];
