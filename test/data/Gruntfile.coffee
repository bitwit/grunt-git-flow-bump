module.exports = (grunt) ->
  grunt.initConfig
    'git-flow-version':
      options:
        files: ['testPackage.json']

  grunt.loadTasks '../../tasks'

  grunt.registerTask 'default', []