module.exports = (grunt) ->
  # load all npm grunt tasks
  require('load-grunt-tasks') grunt

  grunt.initConfig
    mochaTest:
      test:
        options:
          reporter: 'spec',
        src: ['test/**/*.js']

    gitFlowBump:
      options:
        files: ['package.json']
        minorBranch: 'develop'
        majorBranch: 'release'
        pushTo: 'origin'


  grunt.loadTasks('tasks')

  grunt.registerTask 'default', ['mochaTest']
  grunt.registerTask 'test', ['default']