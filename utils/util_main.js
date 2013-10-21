// this is for simple utilities where importing an external package is overkill
// for example if only a couple methods of underscore were needed, the methods could be included
// here rather than requiring the whole underscore package

//adds utility methods to forforf namespace
var util1 = require('./forforf-extend-clone.js').forforf
var util2 = require('./forforf-isString.js').forforf;
var util3 = require('./forforf-randomUrlToken.js').forforf;

var forforf = util1.extend(util1, util2, util3);

module.exports.forforf = forforf;


