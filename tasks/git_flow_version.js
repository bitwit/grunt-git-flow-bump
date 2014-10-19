/*
 * Increase version number
 *
 * grunt bump
 * grunt bump:git
 * grunt bump:patch
 * grunt bump:minor
 * grunt bump:major
 *
 * @author Vojta Jina <vojta.jina@gmail.com>
 * @author Mathias Paumgarten <mail@mathias-paumgarten.com>
 * @author Adam Biggs <email@adambig.gs>
 */

'use strict';

var semver = require('semver');
var exec = require('child_process').exec;

module.exports = function(grunt) {

  var DESC = 'Increment the version, commit, tag and push.';
  grunt.registerTask('git-flow-version', DESC, function(somethingFromCmd) {
    console.log('git flow version is now running');

    var opts = this.options({

    });

    if (somethingFromCmd) {
      grunt.verbose.writeln('some setting here');
    }


    var exactVersionToSet = grunt.option('setversion');
    if (!semver.valid(exactVersionToSet)) {
        exactVersionToSet = false;
    }

    var done = this.async();
    var queue = [];
    var next = function() {
      if (!queue.length) {
        return done();
      }
      queue.shift()();
    };
    var runIf = function(condition, behavior) {
      if (condition) {
        queue.push(behavior);
      }
    };

    // Do something
    var isAlreadyTagged = false;
    runIf(!isAlreadyTagged, function(){

        console.log('running git commands now');

        var gitGetHash = '`git log -n 1 --pretty=format:\'%h\'`';
        var gitCheckContains = 'git branch -a --contains ' + gitGetHash + ' | grep origin/dev';

        console.log(gitCheckContains);

          exec(gitCheckContains, function(err, stdout, stderr){
            if (err) {
              grunt.fatal('Can not get branches containing this commit');
            }
            console.log(stdout.trim());
            next();
          });
    });

    next();
  });


  // ALIASES
    /*
  DESC = 'Increment the version only.';
  grunt.registerTask('bump-only', DESC, function(versionType) {
    grunt.task.run('bump:' + (versionType || '') + ':bump-only');
  });

  DESC = 'Commit, tag, push without incrementing the version.';
  grunt.registerTask('bump-commit', DESC, 'bump::commit-only');
  */
};

/**


 #!/bin/sh

# determine the author of this commit, if it is Strider, we don't need to deploy
AUTHOR_EMAIL=$(git show -s --format=%ae | grep .)
echo $AUTHOR_EMAIL

if [ $AUTHOR_EMAIL != "strider@flowpress.ca" ]
then
    echo "Deploying to production"
    git checkout master  # make sure we are on master always, Strider tests commits on post-receive hooks, not branches

    # look up what other branches contain this commit, if it came from dev, this is a minor release
    REV=`git log -n 1 --pretty=format:'%h'`
    CONTAINS_DEV=$(git branch -a --contains $REV | grep origin/dev)

    if [ "$CONTAINS_DEV" != "" ]
    then
    	echo 'Came from dev, bumping as a minor'
        grunt bump-only:minor
    else # if it doesn't come from dev, we bump it as a patch
    	echo 'Not from dev, must be a fix, bumping as a patch'
        grunt bump-only:patch
    fi

	grunt prod-deploy
	grunt bump-commit
	grunt purge-cdn
else
    echo "Commit author is CD Server, not bumping or deploying"
fi

 */