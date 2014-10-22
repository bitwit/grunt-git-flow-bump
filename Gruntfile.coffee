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
      prod:
        options:
          createTag: yes
          push: yes
          commit: yes
      staging:
        options:
          forceGitVersion: yes
          postBumpTasks: ['tester']


  grunt.loadTasks('tasks')

  grunt.registerTask 'default', ['mochaTest']
  grunt.registerTask 'test', ['default']

  grunt.registerTask 'tester', ->
    grunt.log.writeln 'Hello from the tester task'