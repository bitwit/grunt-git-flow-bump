var q = require('q');

module.exports = {
    //Looping promise
    promiseWhile: function (condition, action) {
        var defferred = q.defer();
        var loop = function () {
            if (!condition()) return defferred.resolve();
            return q.fcall(action)
                .then(loop)
                .catch(defferred.reject);
        };
        process.nextTick(loop);
        return defferred.promise;
    }
};