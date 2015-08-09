/*
 * floox
 * https://github.com/fatfisz/floox
 *
 * Copyright (c) 2015 FatFisz
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function dispatch(dispatcher, actionName, data) {
  dispatcher.dispatch({
    actionName: actionName,
    data: data,
  });
};
