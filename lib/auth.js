

var extend = require('../utils/util_main.js').extend;
var clone = require('../utils/util_main.js').clone;


module.exports = function (config) {

  // config.validator = validator fn
  // config.mailer = mailer fn
  // config.model = persistence model

  return {
    config: clone(config),
    //args: email, challenge, response, cb/listener/promise thing
    //config: validator, mailer, model
    request: function(email, opts, reqConfig){
      var reqConfig = extend({}, config, reqConfig);
      var notString = !(typeof email === 'string' || email instanceof String);
      if (notString) { return new Error('Invalid email, not a string')}


      return "request method"
    }
  }
};