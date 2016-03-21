'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = connectFloox;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _floox_class = require('./floox_class');

var _floox_class2 = _interopRequireDefault(_floox_class);

function getComponentName(Component) {
  if (typeof Component === 'string') {
    return Component;
  }

  return Component.displayName || Component.name || 'anonymous';
}

function getState(floox, mapping, keys, passFloox) {
  var state = floox.state;

  var result = {};

  keys.forEach(function (key) {
    var targetKey = mapping[key];
    result[key] = state[targetKey];
  });

  if (passFloox) {
    result.floox = floox;
  }

  return result;
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
      floox: _react2['default'].PropTypes.instanceOf(_floox_class2['default']).isRequired
    },

    getInitialState: function getInitialState() {
      return getState(this.context.floox, mapping, keys, passFloox);
    },

    componentDidMount: function componentDidMount() {
      this.context.floox.addChangeListener(this.flooxUpdate);
    },

    componentWillUnmount: function componentWillUnmount() {
      this.context.floox.removeChangeListener(this.flooxUpdate);
    },

    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          if (this.state[key] !== nextState[key]) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return false;
    },

    render: function render() {
      return _react2['default'].createElement(Component, _extends({}, this.props, this.state));
    },

    flooxUpdate: function flooxUpdate(callback) {
      this.setState(getState(this.context.floox, mapping, keys, passFloox), callback);
    }
  });
}

module.exports = exports['default'];
