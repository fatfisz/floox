/*
 * floox
 * https://github.com/fatfisz/floox
 *
 * Copyright (c) 2015 FatFisz
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function register(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    eslint: {
      all: [
        'lib',
        'gruntfile.js',
        'test',
      ],
    },

    mochaTest: {
      test: {
        options: {
          timeout: 500,
        },
        src: ['test/**/*.test.js'],
      },
    },

  });

  grunt.registerTask('test', ['mochaTest']);

  grunt.registerTask('default', ['eslint', 'test']);
};
