module.exports = (grunt) ->
  # load all npm grunt tasks
  require('load-grunt-tasks') grunt

  grunt.initConfig
    mochaTest:
      test:
        options:
          reporter: 'spec',
        src: ['test/**/*.js']

  grunt.registerTask 'test', ['mochaTest']

  grunt.registerTask 'default', ['test']