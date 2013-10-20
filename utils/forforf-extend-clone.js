
var extend = require('extend');

var clone = function(obj) {
  if (obj !== Object(obj)) return obj;
  return Array.isArray(obj) ? obj.slice() : extend({}, obj);
};

//just a namespace to prevent clobbering any existing exports names
module.exports.forforf = exports.forforf || {};

module.exports.forforf.extend = extend;
module.exports.forforf.clone = clone;