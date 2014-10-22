#Grunt Git Flow Bump

[![NPM](https://nodei.co/npm/strider-scheduler.png)](https://nodei.co/npm/grunt-git-flow-bump/)

[![Build Status](https://travis-ci.org/bitwit/grunt-git-flow-bump.svg?branch=master)](https://travis-ci.org/bitwit/grunt-git-flow-bump)

> This bumps your git project according to an opinionated git workflow.

> Set up your MAJOR, and MINOR branch name, from which merges will trigger according versions and
all other branch merges will be considered PATCH.

> This grunt task has been developed with continuous delivery in mind, when it may be impractical
to bump manually.

> Never concern yourself with what kind of bumping to give your next version again. Let your workflow
do the talking.

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-bump --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-git-flow-version');
```

### Configuration
In your project's Gruntfile, add a section named `git-flow-version` to the data object passed into `grunt.initConfig()`. The options (and defaults) are:

```js
grunt.initConfig({
  bump: {
    options: {
      files: ['package.json'],
      updateConfigs: [], // array of config properties to update (with files)

      majorBranch: 'release',
      minorBranch: 'develop',
      patchBranch: '*',
      masterOnly: true,

      forceGitVersion: false,
      gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',

      postBumpTasks: [], //tasks to run between versioning and git tag, commit, push

      commit: true,
      commitMessage: 'Release v%VERSION%',
      commitFiles: ['package.json'],

      createTag: true,
      tagName: 'v%VERSION%',
      tagMessage: 'Version %VERSION%',

      push: true,
      pushTo: 'upstream'


    }
  },
})
```

### Options

#### options.files
Type: `Array`
Default value: `['package.json']`

Maybe you wanna bump 'component.json' instead? Or maybe both: `['package.json', 'component.json']`? Can be either a list of files to bump (an array of files) or a grunt glob (e.g., `['*.json']`).

### options.minorBranch

### options.majorBranch

#### options.updateConfigs
Type: `Array`
Default value: `[]`

Sometimes you load the content of `package.json` into a grunt config. This will update the config property, so that even tasks running in the same grunt process see the updated value.

```js
bump: {
  files:         ['package.json', 'component.json'],
  updateConfigs: ['pkg',          'component']
}
```

#### options.commit
Type: `Boolean`
Default value: `true`

Should the changes be committed? False if you want to do additional things.

#### options.commitMessage
Type: `String`
Default value: `Release v%VERSION%`

If so, what is the commit message ? You can use `%VERSION%` which will get replaced with the new version.

#### options.commitFiles
Type: `Array`
Default value: `['package.json']`

An array of files that you want to commit. You can use `['-a']` to commit all files.

#### options.createTag
Type: `Boolean`
Default value: `true`

Create a Git tag?

#### options.tagName
Type: `String`
Default value: `v%VERSION%`

If `options.createTag` is set to true, then this is the name of that tag (`%VERSION%` placeholder is available).

#### options.tagMessage
Type: `String`
Default value: `Version %VERSION%`

If `options.createTag` is set to true, then yep, you guessed right, it's the message of that tag - description (`%VERSION%` placeholder is available).

#### options.push
Type: `Boolean`
Default value: `true`

Push the changes to a remote repo?

#### options.pushTo
Type: `String`
Default value: `upstream`

If `options.push` is set to true, which remote repo should it go to?

#### options.gitDescribeOptions
Type: `String`
Default value: `--tags --always --abbrev=1 --dirty=-d`

Options to use with `$ git describe`

#### options.globalReplace
Type: `Boolean`
Default value: `false`

Replace all occurrences of the version in the file. When set to `false`, only the first occurrence will be replaced.