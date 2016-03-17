'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = defaultCombineState;

function defaultCombineState(currentState, partialState) {
  if (typeof currentState !== 'object' || typeof partialState !== 'object' || currentState === null) {
    return partialState;
  }

  return Object.assign(currentState, partialState);
}

module.exports = exports['default'];
