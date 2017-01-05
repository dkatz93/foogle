const RequestTurtle = require('./dist');
const turtle = new RequestTurtle();

for(var i = 0; i < 35; i++) {
  turtle.request('http://google.com')
    .then(function() {
      console.log('google recieved')
    })
    .catch(console.error);

  turtle.request('http://yahoo.com')
    .then(function() {
      console.log('yahoo recieved')
    })
    .catch(console.error);

}