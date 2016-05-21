'use strict';

const fs = require('fs');

module.exports = fs.readdirSync(__dirname)
  .filter((filename) => filename !== 'versions.js')
  .map((filename) => filename.slice(0, filename.length - 3)); // remove ".js"
