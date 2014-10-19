'use strict';

var _ = require('lodash');
var chai = require('chai');
var expect = chai.expect;

var grunt = require('grunt');
var gitFlowVersion = require('../tasks/git_flow_version');

var testFile = 'test/data/testPackage.json';
var cleanFile = function(){ grunt.file.write(testFile, JSON.stringify({version:'0.0.0'}));};

describe('registration', function() {
    var gruntMock = require('./mocks/grunt');

    before(function() {
        gitFlowVersion(gruntMock);
    });

    after(function() {

    });

    it('should be a function', function() {
        var expected = 'function';
        expect(typeof gitFlowVersion).to.equal(expected);
    });

    it('should register one task', function(){
        expect(gruntMock.tasks.length).to.equal(1);
        var taskNames = _.flatten(gruntMock.tasks, 'name');
        expect(taskNames.indexOf('git-flow-version')).not.to.equal(-1);
    });

});

describe('tasks', function(){
    before(cleanFile);
    after(cleanFile);

    it('should make a new version',function(done){
        grunt.util.spawn({ grunt: true, args: ['git-flow-version', '--gruntfile=test/data/Gruntfile.coffee']}, function(error, result, code) {
            //var testPkg = grunt.file.readJSON(testFile);
            //expect(testPkg.version).to.equal('0.0.1');
            console.log('error, result, code', error, result, code);
            done();
        });
    });
});
