
var forforf = require('../utils/util_main.js').forforf;


//TODO: cloning doesn't work with functions
var extend = forforf.extend;
var clone = forforf.clone;
var isString = forforf.isString;
var randomToken = forforf.randomUrlToken;

function modelDefault(){
  return {
    save: function(){},
    get:  function(){return null}
  }
}

function configDefaults(config){
  config = config || {};
  config.model = config.model || modelDefault();
  return config
}


module.exports = function (config) {

  // config.validator = validator fn
  // config.mailer = mailer fn
  // config.model = persistence model

  //clobbers config
  var authConfig = configDefaults(config);

  var listenerFnNames = [
    'reqReceived',
    'reqValidated'
  ];

  function setDefaults(opts){
    opts = opts || {};
    opts.listener = opts.listener || {};
    opts.staleVerification = opts.staleVerification || 60*60*24 //default 1 day


    listenerFnNames.forEach(function(fnName){
      setCallbackDefault(opts.listener, fnName)
    });

    return opts;
  }

  function setCallbackDefault(listener, listenerFnName){
    if (typeof listener[listenerFnName] === 'function') {
      return listener
    }

    console.log("\n"+'info: No status update for callback named: '+listenerFnName);
    listener[listenerFnName] = function(){};
    return listener
  }

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
      opts = setDefaults(opts);

      var listener = opts.listener;
      var receivedStatusFn = listener.reqReceived;
      var validationStatusFn = listener.reqValidated;

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
