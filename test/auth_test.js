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

  // how to clone functions? until then clobbering occurs
//  it('can be configured without clobbering', function(){
//    var a = auth(config);
//    expect(a.config).to.eql(config);
//    expect(a.config).to.not.equal(config);
//  });

  it('is not a singleton', function(){
    var a1 = auth(config);
    var a2 = auth(configValidationFail);
    expect(a1.config).to.not.eql(a2.config);
  });

  describe('.request', function(){
    var req1, opts1;

    beforeEach(function(){
      var email1 = "email1";

      opts1 = {
        challenge: "who goes there?",
        response: "tis me.",
        listener: function(err, status) {
          console.log('Listener received status update:', status)
        }
      };

      req1 = {
        email: email1,
        challenge: opts1.challenge,
        response: opts1.response,
        listener: opts1.listener
      }
    });

    it('is a function', function(){
      expect(auth(config).request).to.be.a('function');
    });

    it('returns error if email is not a string', function(){
      var email = 32;
      expect( auth(config).request(email) ).to.be.instanceof(Error)
        .and.have.property('message', 'Invalid email, not a string');
    });



    describe('reqReceived', function(){

      it('returns email to  callback if request is valid', function(){
        var email = 'my_email';

        req1.listener.reqReceived = function(err, status) {
          expect(status).to.eql(email);
        };

        expect( auth(config).request(email, req1) ).to.not.be.instanceof(Error)
      });

      it('returns error to callback if email is not a string', function(){
        var email = 32;
        var errorMessage = 'Invalid email, not a string';

        req1.listener.reqReceived = function(err, status) {
          expect(err).to.eql({error: errorMessage});
        };

        expect( auth(config).request(email, req1) ).to.be.instanceof(Error)
          .and.have.property('message', 'Invalid email, not a string');

      });


    });

    describe('reqValidated', function() {

      it('calls the validator in the config options', function(){
        var validEmail = 'my_email';
        var spy=false;

        var vConfig = {
          validator: function(email) {
            spy=true;
            expect(email).to.eql(validEmail);
            return email
          }
        };

        expect( auth(vConfig).request(validEmail, req1)).to.not.be.instanceof(Error);
        expect( spy).to.be.equal(true);

      });

      it('returns email to  callback if request is valid', function(){
        var validEmail = 'my_valid_email';
        var spy = false;
        var statusChecked = false;

        var vConfig = {
          validator: function(email) {
            spy=true;
            expect(email).to.eql(validEmail);
            return email
          }
        };

        req1.listener.reqValidated = function(err, status) {
          statusChecked = true;
          expect(err).to.be.equal(null);
          expect(status).to.eql(validEmail);
        };


        expect( auth(vConfig).request(validEmail, req1) ).to.not.be.instanceof(Error)

        expect(statusChecked).to.equal(true);
      });

      it('returns error to  listener if email does not validate', function(){
        var inValidEmail = 'my_invalid_email';
        var spy = false;
        var statusChecked = false;

        var vConfig = {
          validator: function(email) {
            spy=true;
            expect(email).to.eql(inValidEmail);
            return undefined
          }
        };

        req1.listener.reqValidated = function(err, status) {
          statusChecked = true;
          expect(err).to.be.eql({error: 'failed validation'});
          expect(status).to.eql(undefined);
        };


        expect( auth(vConfig).request(inValidEmail, req1) ).to.be.instanceof(Error)
        expect(statusChecked).to.equal(true);
      });
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


