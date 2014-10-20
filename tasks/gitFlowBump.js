'use strict';

var git = require('../lib/git');
var bump = require('../lib/bump');

module.exports = function (grunt) {

    var DESC = 'Version your project according to an opinionated git workflow';
    grunt.registerTask('gitFlowBump', DESC, function () {
        var opts = this.options({
            files: ['package.json'],
            patchBranch: '*',
            minorBranch: 'develop',
            majorBranch: 'release',
            masterOnly: true,
            updateConfigs: [],
            commit: true,
            commitMessage: 'Release v%VERSION%',
            commitFiles: ['package.json'],
            createTag: true,
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',
            push: true,
            pushTo: 'upstream'
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
                    if(opts.commit){
                        return git.commitChanges(grunt, opts, version);
                    }
                    return version;
                })
                .then(function(version){
                    if(opts.createTag){
                        return git.tagCommit(grunt, opts, version);
                    }
                })
                .then(function(){
                    if(opts.push){
                        return git.pushToRemote(grunt, opts);
                    }
                })
                .catch(function(reason){
                    grunt.fatal(reason);
                })
                .finally(done);
        }

    });

};