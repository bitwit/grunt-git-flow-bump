var q = require('q');
var utils = require('./utils');

module.exports = {
    runTasks: function(grunt, tasks){
        if(tasks.length === 0){
            return false;
        }
        var i = 0;
        var end = tasks.length;
        return utils.promiseWhile(function () {
            return i < end;
        }, function () {
            var promise = runTask(grunt, tasks[i]);
            i++;
            return promise;
        });
    }
};

var runTask = function(grunt, taskName){
    var deferred = q.defer();
    grunt.log.subhead('----- Spawned Task '+ taskName + ' Start -----');
    grunt.util.spawn({ grunt: true, args: [taskName]}, function(error, result, code) {
        if(error){
            return q.reject(error.message);
        }
        grunt.log.write(result);
        grunt.log.writeln('\n');
        grunt.log.subhead('----- Spawned Task '+ taskName + ' Complete -----');
        deferred.resolve();
    });
    return deferred.promise;
};