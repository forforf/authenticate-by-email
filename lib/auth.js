
var forforf = require('../utils/util_main.js').forforf;
var authDefault = require('./auth-default.js').authDefault;
// todo: the sync-async wrappers below can be DRYed up a lot
var authValidator = require('./auth-validator.js').authValidator;
var authModel = require('./auth-model.js').authModel;
var authSender = require('./auth-sender.js').authSender;


//TODO: cloning doesn't work with functions, so remove unnecessary cloning code
var extend = forforf.extend;
var clone = forforf.clone;
var isString = forforf.isString;
var randomToken = forforf.randomUrlToken;

module.exports = function (config) {

  // config.validator = validator fn
  // config.mailer = mailer fn
  // config.model = persistence model
  // config.sender = mailer or other data sender

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

      var randomStr;

      var listener = opts.listener;
      var receivedStatusFn = listener.reqReceived;
      var validationStatusFn = listener.reqValidated;
      var savedStatusFn = listener.reqSaved;
      var sentStatusFn = listener.reqSent;

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

        //generate randomStr to be used as a token id (or random url)
        randomStr = randomToken();

        //savePromise and sendData depend on randomStr existing so must be within this closure

        //save data to model (depends on randomStr existing first)
        var modelData = {
          email: email,
          challenge: opts.challenge,
          response: opts.response,
          randomStr: randomStr,
          staleVerification: opts.staleVerification
        };

        //saveModel and sendData have no data dependencies, just a timing
        //dependency, by using promises we can use chaining to enforce execution order
        // rather than using nesting as would be used in traditional callbacks

        //todo: errors in sendPromise don't seem to propagate
        var modelSavePromise = authModel.savePromise(email, modelData, authConfig.model.save);
        var sendDataPromise  = authSender.sendPromise(email, randomStr, opts.challenge, authConfig.sender);
        modelSavePromise.fail(function(err){
          console.error('Error during saving', err);
          savedStatusFn(err);
          //todo: continue on or stop?
        });

        sendDataPromise.fail(function(err){
          console.error('Error during sending', err);
          sentStatusFn(err);
        });

        modelSavePromise.then(function(modelSaveResp){


          savedStatusFn(null, modelSaveResp);
          sendDataPromise.then(function(sendResp){
            sentStatusFn(null, sendResp);
          })
        })
      });
    }
  }
};
