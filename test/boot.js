'use strict';

const jsdom = require('jsdom').jsdom;
require('should-sinon');

global.document = jsdom();
global.window = global.document.defaultView;
global.navigator = global.window.navigator;
