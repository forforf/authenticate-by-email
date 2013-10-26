'use strict';

var crypto = require('crypto');


var randomUrlToken = function(){
  return crypto.randomBytes(48).toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
};


var forforf = {};
forforf.randomUrlToken = randomUrlToken;
module.exports.forforf = forforf;




