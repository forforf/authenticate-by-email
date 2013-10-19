
//custom utilities (forforf is just a namespace )
var extend = require('../utils/util_main.js').extend;


module.exports = function (config) {
  // config.validator = validator fn
  // config.mailer = mailer fn
  // config.model = persistance model

  return {
    request: function(){
      return "request method"
    }
  }
};