module.exports = (grunt) ->
  # load all npm grunt tasks
  require('load-grunt-tasks') grunt

  grunt.initConfig
    mochaTest:
      test:
        options:
          reporter: 'spec',
        src: ['test/**/*.js']

    'git-flow-version':
      options:
        minorBranch: 'develop'
        majorBranch: 'release'



  grunt.registerTask 'default', ['mochaTest']
  grunt.registerTask 'test', ['default']