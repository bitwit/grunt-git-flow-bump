module.exports = (grunt) ->
  grunt.initConfig
    'git-flow-version':
      options: {}

  grunt.loadTasks '../../tasks'

  grunt.registerTask 'default', []