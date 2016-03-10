'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = waitFor;

function waitFor(internals, storeNames) {
  if (process.env.NODE_ENV !== 'production' && !Array.isArray(storeNames) || !storeNames.length) {
    throw new Error('The only argument to "waitFor" should be a non-empty array.');
  }

  var dispatchTokens = internals.dispatchTokens;

  internals.dispatcher.waitFor(storeNames.map(function (name) {
    if (process.env.NODE_ENV !== 'production' && !dispatchTokens.hasOwnProperty(name)) {
      throw new Error('Store "' + name + '" is not registered');
    }

    return dispatchTokens[name];
  }));
}

module.exports = exports['default'];
