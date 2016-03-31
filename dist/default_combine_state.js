'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = defaultCombineState;

function defaultCombineState(currentState, partialState) {
  if (typeof partialState === 'function') {
    return partialState(currentState);
  }

  if (typeof currentState !== 'object' || typeof partialState !== 'object' || currentState === null) {
    return partialState;
  }

  return _extends(currentState, partialState);
}

module.exports = exports['default'];
