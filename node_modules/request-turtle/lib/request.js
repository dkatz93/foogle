const url = require('url');
const rp = require('request-promise');

const symbols = {
  onResp: Symbol('onResp'),
  onError: Symbol('onError')
};

class Request {
  constructor(options) {
    this.options = options;
    this.promise = new Promise((resolve, reject) => {
      this[symbols.onResp] = resolve;
      this[symbols.onError] = reject;
    });
  }

  execute() {
    return rp(this.options)
      .then(r => {
        this[symbols.onResp](r);
        return r;
      })
      .catch(function(err) {
        this[symbols.onError](err);
        throw err;
      });
  }

  get url() {
    return this.options.uri || this.options
  }

  get host() {
    return url.parse(this.url).host
  }
}

module.exports = Request;