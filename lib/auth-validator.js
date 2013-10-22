var q = require('q');

var failedValidationResponse = function(validatorResponse){

  return validatorResponse ? validatorResponse : {error: 'failed validation'};
};

function commonPromise(syncResp, asyncPromise){
  var d = q.defer();
  if (typeof syncResp === 'undefined') {
    d.resolve(asyncPromise)
  } else {
    d.resolve(syncResp)
  }

  return d.promise;
}

// user can create simple validator (so validator not optional)
//validator maybe async or sync
var validatePromise = function(email, validator){
  var deferred = q.defer();
  if (typeof validator === 'function') {
    var syncResp = validator(email, function(err, asyncResp){
      if(err){
        deferred.reject(failedValidationResponse(err))
      } else {
        deferred.resolve(asyncResp)
      }
    });

    console.log('validateResp');
    console.log(syncResp);
    console.log(deferred.promise);
    console.log('test');
    return commonPromise(syncResp, deferred.promise)
    //return (validatorResp === email) ? [null, validatorResp] : [failedValidationResponse(validatorResp)];
  }

  deferred.reject(['No validator function'])
  return deferred.promise;
};


var authValidator = {
  validatePromise: validatePromise
};

module.exports.authValidator = authValidator;