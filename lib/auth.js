
var forforf = require('../utils/util_main.js').forforf;
var authDefault = require('./auth-default.js').authDefault;
var authValidator = require('./auth-validator.js').authValidator;
var authModel = require('./auth-model.js').authModel;


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

      //Create validator promise that will resolve when validation is completed
      var validatePromise = authValidator.validatePromise(email, authConfig.validator);

      //notify their was validation error
      validatePromise.fail(function(err){
        console.error('validatorErr:',err);
        validationStatusFn(err);
        //todo: Add done function to wrap up
      });

      //If validation passes, continue
      validatePromise.then(function(validationResp){
        validationStatusFn(null, validationResp);

        // save data to model
        var modelData = {
          email: email,
          challenge: opts.challenge,
          response: opts.response,
          randomStr: randomToken(),
          staleVerification: opts.staleVerification
        };

        var modelSavePromise = authModel.savePromise(email, modelData, authConfig.model.save);

        modelSavePromise.fail(function(err){
          console.error('modelSaveErr', err);
          savedStatusFn(err);
          //todo: continue on or stop?
        });

        modelSavePromise.then(function(modelSaveResp){
          console.log('saved Status fn: ', savedStatusFn.toString());
          savedStatusFn(null, modelSaveResp);
        })

      });




//      var modelData = {
//        email: email,
//        challenge: opts.challenge,
//        response: opts.response,
//        randomStr: randomToken(),
//        staleVerification: opts.staleVerification
//      };
//
//      var modelSavePromise = authModel.savePromise(email, modelData, authConfig.model.save);
//
//      //support sync and async
//      authConfig.model.save(email, {
//        email: email,
//        challenge: opts.challenge,
//        response: opts.response,
//        randomStr: randomToken(),
//        staleVerification: opts.staleVerification
//      });
    }
  }
};
