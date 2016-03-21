'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = connectFloox;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function getComponentName(Component) {
  if (typeof Component === 'string') {
    return Component;
  }

  return Component.displayName || Component.name || 'anonymous';
}

function connectFloox(Component, mapping) {
  if (process.env.NODE_ENV !== 'production' && typeof Component !== 'function' && typeof Component !== 'string') {
    // eslint-disable-next-line no-console
    throw new Error('Expected Component to be a string (for built-in components) or a class/function (for composite components).');
  }

  if (process.env.NODE_ENV !== 'production' && (typeof mapping !== 'object' || mapping === null)) {
    // eslint-disable-next-line no-console
    throw new Error('Expected mapping to be an object.');
  }

  var componentName = getComponentName(Component);
  var keys = Object.keys(mapping);

  keys.forEach(function (key) {
    var targetKey = mapping[key];

    if (targetKey === true) {
      mapping[key] = key;
      return;
    }

    if (process.env.NODE_ENV !== 'production' && typeof targetKey !== 'string') {
      // eslint-disable-next-line no-console
      console.error('Warning: The value of the ' + key + ' property should be either "true" or a string, got ' + targetKey + '.');
    }
  });

  var flooxKeyIndex = keys.indexOf('floox');
  var passFloox = flooxKeyIndex !== -1;

  if (passFloox) {
    keys.splice(flooxKeyIndex, 1);
  }

  return _react2['default'].createClass({
    displayName: 'FlooxConnector<' + componentName + '>',

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
      var state = floox.state;

      var props = _objectWithoutProperties(this.props, []);

      keys.forEach(function (key) {
        var targetKey = mapping[key];
        props[key] = state[targetKey];
      });

      if (passFloox) {
        props.floox = floox;
      }

      return _react2['default'].createElement(Component, props);
    },

    flooxUpdate: function flooxUpdate(callback) {
      this.forceUpdate(callback);
    }
  });
}

module.exports = exports['default'];
