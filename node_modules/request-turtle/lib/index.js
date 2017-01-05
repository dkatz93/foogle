const Request = require('./request');
const HostQueue = require('./hostQueue');

const defaults = {
  waitingPeriod: 300,
  warningFrequency: 20 // how many request calls per second will trigger a warning
};

class Turtle {
  constructor(config={}) {
    this.config = Object.assign(defaults, config);
    this.hosts = new Map();
  }

  request(options) {
    const req = new Request(options);
    let q;
    if(this.hosts.has(req.host)) {
      q = this.hosts.get(req.host)
    } else {
      q = new HostQueue(req.host, this);
      this.hosts.set(req.host, q)
    }
    q.enqueue(req);
    return req.promise;
  }
}

module.exports = Turtle;