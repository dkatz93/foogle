# Request Turtle

This is an educational request library. It implements part of the [Request Promise](https://github.com/request/request-promise) API, but it rate-limits requests to the same host. You can use it for web scrapers / crawlers with students and feel confident that they won't accidentally DDoS someone.

## Installation

```bash 
$ npm i request-turtle --save
```

## Usage

```js
const RequestTurtle = require('request-turtle');
const turtle = new RequestTurtle({ limit: 300 }); // limit rate to 300ms. this is the default


for(var i = 0; i < Math.pow(10, 1000); i++) {
  turtle.request('http://momandpopcheesedotcom.biz/about%20us.HTM')
    .then(function(responseBody) {
      // safely make all requests
    });
}
```

At the moment, Request Turtle only implements the request function itself, not the HTTP verb helper methods. This means to make a post request, you need to 

```
const RequestTurtle = require('request-turtle');
const request = new RequestTurtle({ limit: 300 });
turtle.request({ method: "POST", uri: 'http://foo.org' });

```