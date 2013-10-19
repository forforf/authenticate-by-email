function libPath(libFilePath){
  var pathToLib = '../lib/'
  return(pathToLib + libFilePath);
}

var auth = require(libPath('auth.js'));

var expect = require('chai').expect;


describe('auth', function(){
  it('sanity check', function(){
    expect(auth).to.exist;
  });

  it('is a function', function(){
    expect(auth).to.be.a('function');
  });

  describe('auth.request', function(){
    it('is a function', function(){
      expect(auth().request).to.be.a('function');
    });
  });
});


