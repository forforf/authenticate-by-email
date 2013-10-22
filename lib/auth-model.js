var q = require('q');

function commonPromise(syncResp, asyncPromise){
  var d = q.defer();
  if (typeof syncResp === 'undefined') {
    d.resolve(asyncPromise)
  } else {
    d.resolve(syncResp)
  }

  return d.promise;
}

// user can create simple model (so validator not optional)
// model can be async or sync
var modelSavePromise = function(email, modelData, modelSaver){
  var deferred = q.defer();
  if (typeof modelSaver === 'function') {
    var syncResp = modelSaver(email, modelData, function(err, asyncResp){
      if(err){
        deferred.reject('error saving to model')
      } else {
        deferred.resolve(asyncResp)
      }
    });
    return commonPromise(syncResp, deferred.promise)
  }

  deferred.reject(['No model save function'])
  return deferred.promise;
};


var authModel = {
  savePromise: modelSavePromise
};

module.exports.authModel = authModel;