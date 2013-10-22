
var forforf = require('../utils/util_main.js').forforf;

var authDefault = require('./auth-default.js').authDefault




//TODO: cloning doesn't work with functions, so remove unnecessary cloning code
var extend = forforf.extend;
var clone = forforf.clone;
var isString = forforf.isString;
var randomToken = forforf.randomUrlToken;

module.exports = function (config) {

  // config.validator = validator fn
  // config.mailer = mailer fn
  // config.model = persistence model

  //clobbers config
  var authConfig = authDefault.config(config);

  function failedValidationResponse(validatorResponse){
    return validatorResponse ? validatorResponse : {error: 'failed validation'};
  }

  //ToDo: Refactor so that validator is optional
  function validate(email, validator){

    if (typeof validator === 'function') {
      validatorResp = validator(email)

      callbackResp = (validatorResp === email) ? [null, validatorResp] : [failedValidationResponse(validatorResp)];

      return callbackResp;
    }

    return ['No validator function'];
  }

  return {
    config: authConfig,

    //opts:
    // challenge,
    // response,
    // listener
    // staleVerification (seconds)
    request: function(email, opts){
      opts = authDefault.request(opts);

      var listener = opts.listener;
      var receivedStatusFn = listener.reqReceived;
      var validationStatusFn = listener.reqValidated;
      var savedStatusFn = listener.reqSaved;

      if (!isString(email)) {
        var errorMessage = 'Invalid email, not a string';
        receivedStatusFn({error: errorMessage});
        return new Error(errorMessage);
      }

      //received request, provide status update
      receivedStatusFn(null, email);

      validationCbResp = validate(email, authConfig.validator)

      validationStatusFn(validationCbResp[0], validationCbResp[1]);
      //validationStatusFn.apply(null, validationCbResp);

      if (validationCbResp[0]) { // error
        var errorMessage = 'Invalid email, failed validation';
        return new Error(errorMessage);
      }


      //what about async
      authConfig.model.save(email, {
        email: email,
        challenge: opts.challenge,
        response: opts.response,
        randomStr: randomToken(),
        staleVerification: opts.staleVerification
      });

      return "request method"
    }
  }
};
