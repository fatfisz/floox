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
      options: {
        useEslintrc: false,
      },
      all: {
        options: { configFile: '.eslintrc' },
        src: ['lib', 'gruntfile.js'],
      },
      test: {
        options: { configFile: 'test/.eslintrc' },
        src: ['test'],
      },
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
