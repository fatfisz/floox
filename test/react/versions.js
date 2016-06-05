'use strict';

const fs = require('fs');

const versions = fs.readdirSync(__dirname)
  .filter((filename) => filename !== 'versions.js')
  .map((filename) => filename.slice(0, filename.length - 3)); // remove ".js"

if (process.env.TEST_ONE_REACT_ONLY) {
  module.exports = versions.slice(-1);
} else {
  module.exports = versions;
}
