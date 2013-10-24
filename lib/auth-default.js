
/* auth default helpers */
var modelDefault = function(){
  return {
    save: function(){ return 'saving with default model stub, replace with real model' },
    get:  function(){return 'getting with default model stub, replace with real model'}
  }
};

var configDefault = function(config){
  config = config || {};
  config.model = config.model || modelDefault();
  return config
};


/* auth.request default helpers */
var listenerFnNames = [
  'reqReceived',
  'reqValidated',
  'reqSaved',
  'reqSent'
];

var setCallbackDefault = function(listener, listenerFnName){
  if (typeof listener[listenerFnName] === 'function') {
    return listener
  }

  //console.log("\n"+'info: No status update for callback named: '+listenerFnName);
  process.stdout.write('i');
  listener[listenerFnName] = function(){};
  return listener
};

var requestDefaults = function(opts){
  opts = opts || {};
  opts.listener = opts.listener || {};
  opts.staleVerification = opts.staleVerification || 60*60*24 //default 1 day


  listenerFnNames.forEach(function(fnName){
    setCallbackDefault(opts.listener, fnName)
  });

  return opts;
};



var authDefault = {
  config: configDefault,
  request: requestDefaults
};

module.exports.authDefault = authDefault;

