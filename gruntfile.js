'use strict';

const loadGruntTasks = require('load-grunt-tasks');


module.exports = function register(grunt) {
  loadGruntTasks(grunt);

  grunt.initConfig({
    eslint: {
      all: ['lib', 'test'],
    },

    clean: {
      all: ['dist'],
    },

    babel: {
      all: {
        files: [{
          expand: true,
          cwd: 'lib/',
          src: '**/*.js',
          dest: 'dist/',
        }],
      },
    },

    mochaTest: {
      test: {
        options: {
          timeout: 500,
        },
        src: [
          'test/boot.js',
          'test/**/*.test.js',
        ],
      },
    },

  });

  grunt.registerTask('prepublish', ['eslint', 'clean', 'babel']);
  grunt.registerTask('test', ['prepublish', 'mochaTest']);

  grunt.registerTask('default', ['test']);
};
