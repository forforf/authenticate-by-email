function libPath(libFilePath){
  var pathToLib = '../lib/'
  return(pathToLib + libFilePath);
}

var auth = require(libPath('auth.js'));

var expect = require('chai').expect;


describe('auth', function(){
  var config;
  var configValidationFail;

  beforeEach(function(){
    config = {
      validator: function(email) { return email }
    };
    configValidationFail = {
      validator: function(email) { return null }
    }
  });

  it('sanity check', function(){
    expect(auth).to.exist;
  });

  it('is a function', function(){
    expect(auth).to.be.a('function');
  });

  it('can be configured without clobbering', function(){
    var a = auth(config);
    expect(a.config).to.eql(config);
    expect(a.config).to.not.equal(config);
  });

  it('is not a singleton', function(){
    var a1 = auth(config);
    var a2 = auth(configValidationFail);
    expect(a1.config).to.not.eql(a2.config);
  });

  describe('.request', function(){
    var req1;

    beforeEach(function(){
      req1 = {
        email: 'email1',
        challenge: 'Who are you?',
        response: 'I am me',
        callback: function(err, reqResp){
          return [err, reqResp]
        }
      }
    });

    it('is a function', function(){
      expect(auth().request).to.be.a('function');
    });

    it('returns error if email is not a string', function(){
      var email = 32;
      console.dir(auth().request(email));
      expect( auth().request(email) ).to.be.instanceof(Error)
        .and.have.property('message', 'Invalid email, not a string');
    });

    describe('received', function(){

    });

    describe('validation', function() {
      it('validates sucessfully');
    });

    describe('processing', function() {
      it('consumes request');
    });

    describe('callback', function() {
      it('provides callback (Change to emitter?????)');
    });

//    var res1 = a1.config.validator('dummy');
//    var res2 = a2.config.validator('dummy');
//    expect(res1).to.not.eql(res2);
  });
});


