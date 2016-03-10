'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = forEachNestedProperty;
function walker(object, prefix, callback) {
  Object.keys(object).forEach(function (key) {
    var value = object[key];
    var propertyName = prefix + key;

    if (typeof value === 'object' && !Array.isArray(value)) {
      walker(value, propertyName + '.', callback);
      return;
    }

    callback(propertyName, value, key);
  });
}

function forEachNestedProperty(object, callback) {
  walker(object, '', callback);
}

module.exports = exports['default'];
