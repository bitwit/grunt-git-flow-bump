'use strict';

var git = require('../lib/git');
var bump = require('../lib/bump');

module.exports = function (grunt) {

    var DESC = 'Version your project according to an opinionated git workflow';
    grunt.registerTask('git-flow-version', DESC, function () {
        var opts = this.options({
            files: ['package.json'],
            patchBranch: '*',
            minorBranch: 'develop',
            majorBranch: 'release',
            masterOnly: true,
            updateConfigs: [], // array of config properties to update (with files)
            commitMessage: 'Release v%VERSION%',
            commitFiles: ['package.json'],
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%'
        });

        var done = this.async();
        // Do something
        var isAlreadyTagged = false;
        if(!isAlreadyTagged){
            git.determineBumpType(grunt, opts)
                .then(function(bumpAs){
                    return bump.replaceFiles(grunt, opts, bumpAs);
                })
                .then(function(version){
                    return git.commitChanges(grunt, opts, version);
                })
                .then(function(version){
                    return git.tagCommit(grunt, opts, version);
                })
                .then(function(){
                    done();
                })
                .catch(function(reason){
                    grunt.fatal(reason);
                    done();
                });
        }

    });

};