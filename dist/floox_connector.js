'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var FlooxConnector = _react2['default'].createClass({
  displayName: 'FlooxConnector',

  contextTypes: {
    floox: _react2['default'].PropTypes.object.isRequired
  },

  componentDidMount: function componentDidMount() {
    this.context.floox.addChangeListener(this.flooxUpdate);
  },

  componentWillUnmount: function componentWillUnmount() {
    this.context.floox.removeChangeListener(this.flooxUpdate);
  },

  render: function render() {
    var floox = this.context.floox;
    var _props = this.props;
    var children = _props.children;

    var props = _objectWithoutProperties(_props, ['children']);

    var state = floox.state;

    var element = _react2['default'].Children.only(children);

    Object.keys(props).forEach(function (key) {
      var value = props[key];

      if (value === true) {
        props[key] = state[key];
        return;
      }

      if (process.env.NODE_ENV !== 'production' && typeof value !== 'string') {
        // eslint-disable-next-line no-console
        console.error('Warning: The value of the ' + key + ' prop should be "true" or a string.');
      }

      props[key] = state[value];
    });

    props.floox = floox;

    return _react2['default'].cloneElement(element, props);
  },

  flooxUpdate: function flooxUpdate(callback) {
    this.forceUpdate(callback);
  }
});

exports['default'] = FlooxConnector;
module.exports = exports['default'];
