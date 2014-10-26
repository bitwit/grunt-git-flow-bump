'use strict';

var q = require('q');
var git = require('../lib/git');
var bump = require('../lib/bump');
var taskSpawner = require('../lib/taskSpawner');

module.exports = function (grunt) {

    var DESC = 'Version your project according to an opinionated git workflow';
    grunt.registerMultiTask('gitFlowBump', DESC, function () {
        var opts = this.options({
            //File and config update related
            files: ['package.json'],
            updateConfigs: [],

            //Branch versioning rules related
            majorBranch: 'release',
            minorBranch: 'develop',
            patchBranch: '*',
            masterOnly: true,

            //Bumping Related
            //Git versioning
            forceGitVersion: false,
            gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
            //Post Bump
            postBumpTasks: [],

            //Commit related
            commit: true,
            commitMessage: 'Release v%VERSION%',
            commitFiles: ['package.json'],

            //Tag related
            createTag: true,
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',

            //Push related
            push: true,
            pushTo: 'upstream'
        });

        var done = this.async();
        var version;
        // First check if the commit is already tagged
        q.fcall(function () {
            return git.isCommitTagged(grunt, opts);
        })
            // Next, if tagged exit quietly
            // Otherwise, look at the
            .then(function (isTagged) {
                if (isTagged) {
                    grunt.log.writeln('Commit is already tagged');
                    return q.reject(null);
                } else if(opts.forceGitVersion){
                    return null;
                } else {
                    return git.getCommitHash(grunt, opts);
                }
            })
            .then(function (hash) {
                if (opts.forceGitVersion) {
                    var deferred = q.defer();
                    var firstAction = function () {
                        deferred.resolve('git');
                    };
                    process.nextTick(firstAction);
                    return deferred.promise;
                }
                else {
                    return git.determineBumpType(grunt, opts, hash);
                }
            })
            .then(function (bumpAs) {
                if (bumpAs === 'git') {
                    grunt.log.ok('Using git versioning');
                    return git.getGitVersion(grunt, opts);
                } else {
                    return bump.getExactVersion(grunt, opts, bumpAs);
                }
            })
            .then(function (bumpTo) {
                version = bumpTo;
                grunt.log.ok('Bumping files to ' + bumpTo);
                return bump.replaceFiles(grunt, opts, bumpTo);
            })
            .then(function () {
                return taskSpawner.runTasks(grunt, opts.postBumpTasks);
            })
            .then(function () {
                if (opts.forceGitVersion) {
                    return q.reject(null);
                }
                if (opts.commit) {
                    return git.commitChanges(grunt, opts, version);
                }
                return version;
            })
            .then(function () {
                if (opts.createTag) {
                    return git.tagCommit(grunt, opts, version);
                }
            })
            .then(function () {
                if (opts.push) {
                    return git.pushToRemote(grunt, opts);
                }
            })
            .catch(function (reason) {
                if (reason !== null) {
                    grunt.fatal(reason);
                } else {
                    grunt.log.writeln('Finishing early');
                }
            })
            .finally(done);

    });

};