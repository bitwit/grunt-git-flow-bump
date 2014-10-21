var q = require('q');
var semver = require('semver');

var VERSION_REGEXP = /([\'|\"]?version[\'|\"]?[ ]*:[ ]*[\'|\"]?)([\d||A-a|.|-]*)([\'|\"]?)/i;

var promiseWhile = function (condition, action) {
    var defferred = q.defer();
    var loop = function () {
        if (!condition()) return defferred.resolve();
        return q.fcall(action)
            .then(loop)
            .catch(defferred.reject);
    };
    process.nextTick(loop);
    return defferred.promise;
};

module.exports = {
    getExactVersion: function(grunt, opts, bumpAs){
        if(opts.files.length < 1){
            return q.reject('No files set to bump');
        } else {
            var file = opts.files[0];
            var version = null;
            grunt.file.read(file).replace(VERSION_REGEXP, function (match, prefix, parsedVersion, suffix) {
                version = semver.inc(parsedVersion, bumpAs || 'patch');
                return prefix + version + suffix;
            });
            if (!version) {
                return q.reject('Can not find a version to bump in ' + file);
            }
            return version;
        }
    },
    replaceFiles: function (grunt, opts, bumpTo) {
        var deferred = q.defer();

        var i = 0;
        var end = opts.files.length;

        return promiseWhile(function () {
            return i < end;
        }, function () {
            var idx = i;
            i++;
            var file = opts.files[idx];
            var version = null;

            var content = grunt.file.read(file).replace(VERSION_REGEXP, function (match, prefix, parsedVersion, suffix) {
                version = bumpTo; //we set this to indicate a replace was successful
                return prefix + version + suffix;
            });

            if (!version) {
                return deferred.reject('Can not find a version to bump in ' + file);
            }

            grunt.file.write(file, content);

            var configProperty = opts.updateConfigs[idx];
            if (!configProperty) {
                return;
            }

            var cfg = grunt.config(configProperty);
            if (!cfg) {
                return deferred.reject('Can not update "' + configProperty + '" config, it does not exist!');
            }

            cfg.version = version;
            grunt.config(configProperty, cfg);
            grunt.log.ok(configProperty + '\'s version updated');

        })
        .then(function () {
            return bumpTo;
        });
    }
};
