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
    floox: _react2['default'].PropTypes.instanceOf(_floox_class2['default']).isRequired
  },

  childContextTypes: {
    floox: _react2['default'].PropTypes.instanceOf(_floox_class2['default']).isRequired
  },

  getChildContext: function getChildContext() {
    return {
      floox: this.props.floox
    };
  },

  render: function render() {
    return _react2['default'].Children.only(this.props.children);
  }
});

exports['default'] = FlooxProvider;
module.exports = exports['default'];
