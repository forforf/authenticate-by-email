var q = require('q');

var failedSendingResponse = function(sendingResponse){

  return sendingResponse ? sendingResponse : {error: 'failed to send'};
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

// user can create simple sender (so sender not optional)
//sender can be async or sync (sync is not recommended for sender though
// as it's a blocking operaton then)
var sendPromise = function(email, randomStr, challenge, sender){
  var deferred = q.defer();

  if (typeof sender === 'function') {
    var syncResp = sender(email, randomStr, challenge, function(err, asyncResp){
      if(err){
        deferred.reject(failedSendingResponse(err))
      } else {
        deferred.resolve(asyncResp)
      }
    });
    return commonPromise(syncResp, deferred.promise)
  }

  deferred.reject(['No sending function'])
  return deferred.promise;
};


var authSender = {
  sendPromise: sendPromise
};

module.exports.authSender = authSender;