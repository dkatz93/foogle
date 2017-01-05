const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const Bluebird = require('bluebird');
const HostQueue = require('../lib/hostQueue');
const Request = require('../lib/request');

describe('HostQueue', () => {
  let hq, stub;

  beforeEach(() => {
    stub = sinon
      .stub(Request.prototype, 'execute')
      .returns(Bluebird.resolve());
  });

  afterEach(() => {
    stub.restore();
  });


  beforeEach(() => {
    hq = new HostQueue('google.com', {
      config: {
        warningFrequency: 20,
        waitingPeriod: 100
      }
    });
  });

  describe('frequency', () => {
    it('has 0 to begin with', () => {
      expect(hq.frequency).to.equal(0);
    });

    it('has frequency 3 right after 3 calls', () => {
      hq.enqueue();
      hq.enqueue();
      hq.enqueue();
      expect(hq.frequency).to.equal(3);
    });

    it('has 0 after 1 second passes', done => {
      hq.enqueue();
      hq.enqueue();
      hq.enqueue();
      setTimeout(() => {
        expect(hq.frequency).to.equal(0);
        done();
      }, 1050)
    })

  });

  describe('enqueue', () => {
    it('eventually executes the request', () => {
      const req = new Request();
      hq.enqueue(req);
      expect(req.execute.called).to.be.true;
    });

    it('only calls one right away', () => {
      const reqs = [
        new Request('foo'),
        new Request(),
        new Request()
      ];

      reqs[0].execute = sinon.spy();
      reqs[1].execute = sinon.spy();
      reqs[2].execute = sinon.spy();

      for(let req of reqs) {
        hq.enqueue(req);
      }

      expect(reqs[0].execute.called).to.be.true;
      expect(reqs[1].execute.called).to.be.false;
      expect(reqs[2].execute.called).to.be.false;
    })

    it('only calls all eventually', done => {
      const reqs = [
        new Request('foo'),
        new Request(),
        new Request()
      ];

      reqs[0].execute = sinon.spy();
      reqs[1].execute = sinon.spy();
      reqs[2].execute = sinon.spy();

      for(let req of reqs) {
        hq.enqueue(req);
      }

      setTimeout(() => {
        expect(reqs[0].execute.called).to.be.true;
        expect(reqs[1].execute.called).to.be.true;
        expect(reqs[2].execute.called).to.be.true;
        done();
      }, 350)
    })
  })

});