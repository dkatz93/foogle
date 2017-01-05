const timer = require('./timer');
const config = require('./config');

const symbols = {
  requests: Symbol('requests'),
  dequeue: Symbol('dequeue'),
  draining: Symbol('draining'),
  tickFrequency: Symbol('tickFrequency'),
  warnUser: Symbol('warnUser'),
  drain: Symbol('drain')
};

class HostQueue {
  constructor(host, turtle) {
    this.host = host;
    this.frequency = 0;
    this.turtle = turtle;
    this[symbols.requests] = [];
    this[symbols.draining] = false;
  }

  get size() {
    return this[symbols.requests].length;
  }

  get isRateLimitExceeded() {
    return this.frequency > this.turtle.config.warningFrequency;
  }

  enqueue(req) {
    this[symbols.tickFrequency]();
    if(this.isRateLimitExceeded) {
      this[symbols.warnUser]();
    }
    this[symbols.requests].push(req);
    return this[symbols.drain]();
  }

  [symbols.tickFrequency]() {
    this.frequency++;
    setTimeout(() => this.frequency--, 1000);
  }

  [symbols.warnUser]() {
      console.warn('--YOU ARE MAKING TOO MANY REQUESTS TO', this.host, '--');
      console.warn('  Request frequency', this.frequency);
      console.warn('  we are rate limiting requests to', this.host);
      console.warn('  but if we weren\'t it would be bad.');
  }

  async [symbols.drain]() {
    if(this[symbols.draining]) { return; }
    this[symbols.draining] = true;
    while(this.size) {
      const req = this[symbols.dequeue]();
      await req.execute();
      await timer(this.turtle.config.waitingPeriod);
    }
    this[symbols.draining] = false;
  }

  [symbols.dequeue]() {
    return this[symbols.requests].shift();
  }
}

module.exports = HostQueue;