var _ = require('lodash');
var exec = require('child_process').exec;
var q = require('q');

var cmdGetCurrentGitHash = '`git rev-parse HEAD`';

// git log -n 1 --pretty=format:'%h'
// get latestTag: git describe --abbrev=0 --tags --candidates 1
// commits between: git log <yourlasttag>..HEAD

// git log `git describe --abbrev=0 --tags --candidates 1`..`git log -n 1 --pretty=format:'%h'` --oneline


module.exports = {
    getCommitHash: function(grunt, opts){
        var gitCheckContains = 'git rev-list --parents -n 1 ' + cmdGetCurrentGitHash;
        var deferred = q.defer();
        exec(gitCheckContains, function (err, stdout, stderr) {
            if (err) {
                return deferred.reject('Can not get commit details');
            }
            var hashes = stdout.trim().split(' ');
            var hash = null;
            if(hashes.length === 2){
                //This means we have the current hash an it's one parent
                hash = hashes[0]; //we will determine bump by the current commit
            } else if(hashes.length === 3){
                //This means there are 2 parents i.e. it is a merge commit
                hash = hashes[2]; //we will determine bump by the last commit before the merge (i.e. the second)
                grunt.log.writeln('This is a --no-ff merge commit');
            }
            return deferred.resolve(hash);
        });
        return deferred.promise;
    },
    isCommitTagged: function(){
        var gitCheckContains = 'git tag --contains ' + cmdGetCurrentGitHash;
        var deferred = q.defer();
        exec(gitCheckContains, function (err, stdout, stderr) {
            if (err) {
                return deferred.reject('Can not get branches containing this commit');
            }
            var tags = _.compact(stdout.trim().split('\n'));
            return deferred.resolve(tags.length !== 0);
        });
        return deferred.promise;
    },
    determineBumpType: function (grunt, opts, specificHash) {
        var gitCheckContains = 'git branch -a --contains ' + specificHash;
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
                return deferred.reject('You are currently not on master.');
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

           return deferred.resolve(bumpAs);
        });

        return deferred.promise;
    },
    getGitVersion: function(grunt, opts){
        // GET VERSION FROM GIT
        var deferred = q.defer();
        exec('git describe ' + opts.gitDescribeOptions, function(err, stdout, stderr){
            if (err) {
                return q.reject('Can not get a version number using `git describe`');
            }
            var gitVersion = stdout.trim();
            return deferred.resolve(gitVersion);
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
            return deferred.resolve(version);
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
            return deferred.resolve();
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
            return deferred.resolve();
        });
        return deferred.promise;
    }
};