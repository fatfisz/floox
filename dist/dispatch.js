"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = dispatch;

function dispatch(dispatcher, actionName, data) {
  dispatcher.dispatch({
    actionName: actionName,
    data: data
  });
}

module.exports = exports["default"];
