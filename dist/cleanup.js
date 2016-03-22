"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = cleanup;

function cleanup(data) {
  // Clone callbacks, as they might contain calls to `setState`
  var callbacks = [].concat(data.callbacks);

  data.isSetting = false;
  data.partialStates.length = 0;
  data.callbacks.length = 0;

  callbacks.forEach(function (callback) {
    callback();
  });
}

module.exports = exports["default"];
