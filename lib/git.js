var _ = require('lodash');
var exec = require('child_process').exec;
var q = require('q');

module.exports = {
    determineBumpType: function (grunt, opts) {
        var gitGetHash = '`git log -n 1 --pretty=format:\'%h\'`';
        var gitCheckContains = 'git branch -a --contains ' + gitGetHash;
        var deferred = q.defer();

        exec(gitCheckContains, function (err, stdout, stderr) {
            if (err) {
                deferred.reject('Can not get branches containing this commit');
            }

            var branches = stdout.trim().split('\n');
            var bumpAs = 'patch';
            var foundBranch = null;
            var isOnMaster = true;

            branches = _.map(branches, function (branch) {
                var o = branch.trim();
                if (o.indexOf('*') !== -1) {
                    var name = o.substring(2, branch.length);
                    return name;
                } else {
                    return o;
                }
            });

            if(branches.indexOf('master') === -1){
                isOnMaster = false;
            }

            if (!isOnMaster && opts.masterOnly) {
                grunt.fail.warn('You are currently not on master.');
            } else {
                if (branches.indexOf(opts.minorBranch) !== -1) {
                    foundBranch = opts.minorBranch;
                    bumpAs = 'minor';
                } else if (branches.indexOf(opts.majorBranch) !== -1) {
                    foundBranch = opts.majorBranch;
                    bumpAs = 'major';
                }
                grunt.log.writeln(((foundBranch !== null) ? 'Found on ' + foundBranch + '. ' : 'This commit is not contained in a special branch. ') + 'Bumping as ' + bumpAs + '.');
            }

            deferred.resolve(bumpAs);
        });

        return deferred.promise;
    },
    commitChanges: function(grunt, opts, version){
        var deferred = q.defer();
        var commitMessage = opts.commitMessage.replace('%VERSION%', version);
        exec('git commit ' + opts.commitFiles.join(' ') + ' -m "' + commitMessage + '"', function(err, stdout, stderr) {
            if (err) {
                deferred.reject('Can not create the commit:\n  ' + stderr);
            }
            grunt.log.ok('Committed as "' + commitMessage + '"');
            deferred.resolve(version);
        });
        return deferred.promise;
    },
    tagCommit: function(grunt, opts, version){
        var deferred = q.defer();
        var tagName = opts.tagName.replace('%VERSION%', version);
        var tagMessage = opts.tagMessage.replace('%VERSION%', version);

        exec('git tag -a ' + tagName + ' -m "' + tagMessage + '"' , function(err, stdout, stderr) {
            if (err) {
                deferred.reject('Can not create the tag:\n  ' + stderr);
            }
            grunt.log.ok('Tagged as "' + tagName + '"');
            deferred.resolve();
        });
        return deferred.promise;
    },
    pushToRemote: function(grunt, opts){
        var deferred = q.defer();
        exec('git push ' + opts.pushTo + ' && git push ' + opts.pushTo + ' --tags', function(err, stdout, stderr) {
            if (err) {
                deferred.reject('Can not push to ' + opts.pushTo + ':\n  ' + stderr);
            }
            grunt.log.ok('Pushed to ' + opts.pushTo);
            deferred.resolve();
        });
        return deferred.promise;
    }
};