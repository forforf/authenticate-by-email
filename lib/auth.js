

var extend = require('../utils/util_main.js').extend;
var clone = require('../utils/util_main.js').clone;


module.exports = function (config) {

  // config.validator = validator fn
  // config.mailer = mailer fn
  // config.model = persistence model

  var authConfig = clone(config);

  return {
    config: clone(authConfig),

    //opts: challenge, response, listener
    request: function(email, opts){

      var receivedStatusFn;

      var reqRcvFnName = 'reqReceived';

      opts = opts || {};
      opts.listener = opts.listener || {};


      if (typeof opts.listener[reqRcvFnName] === 'function') {
        receivedStatusFn =  opts.listener[reqRcvFnName];
      } else {
        console.log('INFO: No \''+reqRcvFnName+'\' function defined to receive status update');
        receivedStatusFn = function(){};
      }

      var notString = !(typeof email === 'string');
      if (notString) {
        var errorMessage = 'Invalid email, not a string';
        receivedStatusFn({typeError: errorMessage});
        return new Error(errorMessage);
      }

      receivedStatusFn(null, email);
      return "request method"
    }
  }
};