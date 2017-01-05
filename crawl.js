const RequestTurtle = require('request-turtle');
const turtle = new RequestTurtle({ limit: 300 }); // limit rate to 300ms. this is the default 
const db = require('./models') 
 
for(var i = 0; i < Math.pow(10, 1000); i++) {
  turtle.request('http://momandpopcheesedotcom.biz/about%20us.HTM')
    .then(function(responseBody) {
      // safely make all requests 
    });
}