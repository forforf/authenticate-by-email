var q = require('q');


function libPath(libFilePath){
  var pathToLib = '../lib/'
  return(pathToLib + libFilePath);
}

var auth = require(libPath('auth.js'));

var expect = require('chai').expect;


describe('auth', function(){
  var config;
  var configValidationFail;

  var modelStub = function(){
    var _modelData = {};
    return {
      save: function(key, values){
        _modelData[key] = values;
      },
      get:  function(key){
        return _modelData[key];
      },
      all: function(){
        return _modelData;
      }
    };
  }();

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
        listener: {}
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
        var callbackSpy = false;

        req1.listener.reqReceived = function(err, status) {
          callbackSpy = true;
          expect(status).to.eql(email);
        };

        expect( auth(config).request(email, req1) ).to.not.be.instanceof(Error)
        expect( callbackSpy).to.equal(true);
      });

      it('returns error to callback if email is not a string', function(){
        var email = 32;
        var errorMessage = 'Invalid email, not a string';
        var callbackSpy = false;

        req1.listener.reqReceived = function(err, status) {
          callbackSpy = true;
          expect(err).to.eql({error: errorMessage});
        };

        expect( auth(config).request(email, req1) ).to.be.instanceof(Error)
          .and.have.property('message', 'Invalid email, not a string');
        expect( callbackSpy).to.equal(true);

      });
    });

    describe('reqValidated', function() {

      describe('call validator', function(){

        it('calls the validator in the config options', function(){
          var avalidEmail = 'my_email';
          var aspy=false;

          var vConfig = {
            validator: function(email) {
              aspy=true;
              expect(email).to.eql(avalidEmail);
              return email
            }
          };

          expect( auth(vConfig).request(avalidEmail, req1)).to.not.be.instanceof(Error);
          expect( aspy).to.be.equal(true);

        });

      });

      describe('sync', function(){
        it('returns email to  callback if request is valid', function(done){
          var validEmail = 'my_valid_email';
          var spy = false;
          var statusChecked = q.defer();
          var statusPromise = statusChecked.promise;

          var vConfig = {
            validator: function(email) {
              spy=true;
              expect(email).to.eql(validEmail);
              return email
            }
          };

          req1.listener.reqValidated = function(err, status) {
            statusChecked.resolve(true);
            console.log('listener.reqValidated runnnig');
            expect(err).to.be.equal(null);
            expect(status).to.eql(validEmail);
          };


          expect( auth(vConfig).request(validEmail, req1) ).to.not.be.instanceof(Error)
          expect( spy).to.equal(true);
          statusPromise.then(function(result){
            expect(result).to.equal(true);
            done();
          });

          //.expect(statusChecked).to.equal(true);

        });


        it('returns error to  listener if email does not validate', function(done){
          var inValidEmail = 'my_invalid_email';
          var spy = false;
          var statusChecked = q.defer();
          var statusPromise = statusChecked.promise;

          var vConfig = {
            validator: function(email) {
              spy=true;
              expect(email).to.eql(inValidEmail);
              return null
            }
          };

          req1.listener.reqValidated = function(err, status) {
            statusChecked.resolve(true);
            expect(err).to.be.eql({error: 'failed validation'});
            expect(status).to.eql(undefined);
          };

          expect( auth(vConfig).request(inValidEmail, req1) ).to.not.be.instanceof(Error)
          statusPromise.then(function(result){
            expect(result).to.equal(true);
            done();
          });
        });
      });

      describe('async', function(){
        it('returns email to  callback if request is valid', function(){
          var validEmail = 'my_valid_email';
          var spy = false;
          var statusChecked = q.defer();
          var statusPromise = statusChecked.promise;

          var vConfig = {
            validator: function(email, cb) {
              spy=true;
              expect(email).to.eql(validEmail);
              cb(null, email);
            }
          };

          req1.listener.reqValidated = function(err, status) {
            statusChecked.resolve(true);
            expect(err).to.be.eql({error: 'failed validation'});
            expect(status).to.eql(undefined);
          };

          expect( auth(vConfig).request(validEmail, req1) ).to.not.be.instanceof(Error)
          statusPromise.then(function(result){
            expect(result).to.equal(true);
            done();
          });
        });


        it('returns error to  listener if email does not validate', function(){
          var inValidEmail = 'my_invalid_email';
          var spy = false;
          var statusChecked = q.defer();
          var statusPromise = statusChecked.promise;

          var vConfig = {
            validator: function(email, cb) {
              spy=true;
              expect(email).to.eql(inValidEmail);
              cb(null, email);
            }
          };

          req1.listener.reqValidated = function(err, status) {
            statusChecked.resolve(true);
            expect(err).to.be.eql({error: 'failed validation'});
            expect(status).to.eql(undefined);
          };

          expect( auth(vConfig).request(inValidEmail, req1) ).to.not.be.instanceof(Error)
          statusPromise.then(function(result){
            expect(result).to.equal(true);
            done();
          });
        });
      });
    });

    describe('model', function() {

      describe('saving', function(){
        var validEmail;
        var mConfig;
        var authResp;

        beforeEach(function(){
          validEmail = 'email_to_persist'
          mConfig = {
            validator: function(email) {
              return email
            },
            model: modelStub
          };

          //create the request
          authResp = auth(mConfig).request(validEmail, req1)
        });

        it('does not error when requesting', function(){
          expect( authResp ).to.not.be.instanceof(Error);
        });

        it('saves email to the model', function(){
          var record = mConfig.model.get(validEmail);
          expect( record.email ).to.eql(validEmail);
        });

        it('saves challenge/response to the model', function(){
          var record = mConfig.model.get(validEmail);
          expect( record.challenge ).to.eql(req1.challenge);
          expect( record.response ).to.eql(req1.response);
        });

        it('saves a randomStr to the model', function(){
          var record = mConfig.model.get(validEmail);
          expect( typeof record.randomStr ).to.equal('string');
          expect( record.randomStr.length).to.equal(64);
        });

        it('saves a staleVerification to the model', function(){
          var record = mConfig.model.get(validEmail);
          expect( record.staleVerification).to.be.within(0, Infinity);
        });

        xit('returns email to reqSaved callback when record saved', function(){
          var email = 'saved_email';
          var callbackSpy = false;

          req1.listener.reqSaved = function(err, status) {
            callbackSpy = true;
            expect(status).to.eql(email);
          };

          expect( auth(config).request(email, req1) ).to.not.be.instanceof(Error)
          expect( callbackSpy).to.equal(true);
        });

//        it('returns error to callback if email is not a string', function(){
//          var email = 32;
//          var errorMessage = 'Invalid email, not a string';
//          var callbackSpy = false;
//
//          req1.listener.reqReceived = function(err, status) {
//            callbackSpy = true;
//            expect(err).to.eql({error: errorMessage});
//          };
//
//          expect( auth(config).request(email, req1) ).to.be.instanceof(Error)
//            .and.have.property('message', 'Invalid email, not a string');
//          expect( callbackSpy).to.equal(true);
//
//        });
      });
    });

//    var res1 = a1.config.validator('dummy');
//    var res2 = a2.config.validator('dummy');
//    expect(res1).to.not.eql(res2);
  });
});


