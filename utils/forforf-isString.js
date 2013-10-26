'use strict';

var isString = function(str) {
  return typeof str === 'string';
};

var forforf = {};
forforf.isString = isString;
module.exports.forforf = forforf;