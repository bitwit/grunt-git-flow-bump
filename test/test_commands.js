'use strict';

var _ = require('lodash');
var chai = require('chai');
var cap = require('chai-as-promised');
var expect = chai.expect;
chai.use(cap);
chai.should();

var grunt = require('grunt');
var gitFlowBump = require('../tasks/gitFlowBump');

var testFile = 'test/data/testPackage.json';
var cleanFile = function () {
    grunt.file.write(testFile, JSON.stringify({version: '0.0.0'}));
};

describe('registration', function () {
    var gruntMock = require('./mocks/grunt');

    before(function () {
        gitFlowBump(gruntMock);
    });

    after(function () {

    });

    it('should be a function', function () {
        var expected = 'function';
        expect(typeof gitFlowBump).to.equal(expected);
    });

    it('should register one task', function () {
        expect(gruntMock.tasks.length).to.equal(1);
        var taskNames = _.flatten(gruntMock.tasks, 'name');
        expect(taskNames.indexOf('gitFlowBump')).not.to.equal(-1);
    });

});

describe('lib functions', function () {
    var bump = require('../lib/bump');

    beforeEach(cleanFile);
    afterEach(cleanFile);

    it('should bump file as patch', function () {
        var opts = {
            files: [testFile],
            updateConfigs: []
        };
        var bumpAs = 'patch';
        var expected = '0.0.1';
        return bump.replaceFiles(grunt, opts, bumpAs)
            .should.eventually.equal(expected)
            .notify(function () {
                var testPkg = grunt.file.readJSON(testFile);
                return testPkg.version;
            })
            .should.eventually.equal(expected);
    });

    it('should bump file as minor', function () {
        var opts = {
            files: [testFile],
            updateConfigs: []
        };
        var bumpAs = 'minor';
        var expected = '0.1.0';
        return bump.replaceFiles(grunt, opts, bumpAs)
            .should.eventually.equal(expected)
            .notify(function () {
                var testPkg = grunt.file.readJSON(testFile);
                return testPkg.version;
            })
            .should.eventually.equal(expected);
    });

    it('should bump file as major', function () {
        var opts = {
            files: [testFile],
            updateConfigs: []
        };
        var bumpAs = 'major';
        var expected = '1.0.0';
        return bump.replaceFiles(grunt, opts, bumpAs)
            .should.eventually.equal(expected)
            .notify(function () {
                var testPkg = grunt.file.readJSON(testFile);
                return testPkg.version;
            })
            .should.eventually.equal(expected);
    });

});

describe('git functions', function () {
    var git = require('../lib/git');
    it('should return a patch release type', function () {
        var opts = {
            masterOnly: false,
            minorBranch: '',
            majorBranch: ''
        };
        return git.determineBumpType(grunt, opts)
            .should.eventually.equal('patch');
    });
});