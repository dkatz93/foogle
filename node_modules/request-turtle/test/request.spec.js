const chai = require('chai');
const expect = chai.expect;
const Bluebird = require('bluebird');
const sinon = require('sinon');
const mock = require('mock-require');

const spyRegistry = {};


mock('request-promise', function() { 
  spyRegistry.spy();
  return Bluebird.resolve();
});

mock.reRequire('../lib/request');

const Request = require('../lib/request');

describe('Request', () => {
  describe('host', () => {
    it('pulls host from raw url', () => {
      const req = new Request('http://foobar.com/foo/bar');
      expect(req.host).to.equal('foobar.com');
    });

    it('pulls host out of obj', () => {
      const req = new Request({
        uri: 'http://foobar.com/foo/bar'
      });
      expect(req.host).to.equal('foobar.com');
    })
  });

  describe('execute', () => {
    let req;
    beforeEach(() => {
      req = new Request('http://fullstack.com');
    })
    beforeEach(() => {
      spyRegistry.spy = sinon.spy();
    });
    after(() => {
      mock.stopAll();
    });

    it('calls request-promise', () => {
      req.execute();
      expect(spyRegistry.spy.called).to.be.true;
    });

    it('does not resolve the requests promise if execute is not called', () => {
      const promiseSpy = sinon.spy();
      req.promise.then(promiseSpy);
      expect(promiseSpy.called).to.be.false;
    });

    it('resolves the promise upon execute', (done) => {
      const promiseSpy = sinon.spy();
      req.promise.then(promiseSpy);
      req.execute()
        .then(() => {
          setTimeout(function() {
            expect(promiseSpy.called).to.be.true;
            done();
          }, 0)
          
        });
    });



  });
});