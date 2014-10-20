module.exports = (grunt) ->
  grunt.initConfig
    gitFlowBump:
      options:
        files: ['testPackage.json']

  grunt.loadTasks '../../tasks'

  grunt.registerTask 'default', []