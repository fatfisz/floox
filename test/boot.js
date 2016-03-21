'use strict';

const jsdom = require('jsdom').jsdom;
const mockery = require('mockery');
require('should-sinon');


// Set up jsdom
global.document = jsdom();
global.window = global.document.defaultView;
global.navigator = global.window.navigator;

// Set up mockery
beforeEach(() => {
  mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false,
  });
});

afterEach(() => {
  mockery.disable();
});
