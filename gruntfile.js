'use strict';

const loadGruntTasks = require('load-grunt-tasks');
const rollupPluginBabel = require('rollup-plugin-babel');


module.exports = function register(grunt) {
  loadGruntTasks(grunt);

  grunt.initConfig({
    eslint: {
      all: ['lib', 'test'],
    },

    clean: {
      all: ['dist', 'tmp'],
    },

    rollup: {
      all: {
        options: {
          external: 'react',
          plugins: [
            rollupPluginBabel(),
          ],
          format: 'cjs',
        },
        files: {
          'dist/index.js': 'lib/index.js',
        },
      },
    },

    babel: {
      all: {
        files: [{
          expand: true,
          cwd: 'lib/',
          src: '**/*.js',
          dest: 'tmp/',
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

  grunt.registerTask('prepublish', ['eslint', 'clean', 'rollup']);
  grunt.registerTask('test', ['prepublish', 'babel', 'mochaTest']);

  grunt.registerTask('default', ['test']);
};
