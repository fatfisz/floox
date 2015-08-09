/*
 * floox
 * https://github.com/fatfisz/floox
 *
 * Copyright (c) 2015 FatFisz
 * Licensed under the MIT license.
 */

'use strict';

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

module.exports = function forEachNestedProperty(object, callback) {
  walker(object, '', callback);
};
