'use strict';

var extend = require('extend');

var clone = function(obj) {
  if (obj !== Object(obj)) { return obj; }
  return Array.isArray(obj) ? obj.slice() : extend({}, obj);
};

var forforf = {};
forforf.extend = extend;
forforf.clone = clone;

module.exports.forforf = forforf;