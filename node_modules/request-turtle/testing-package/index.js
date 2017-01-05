const Turtle = require('request-turtle');

const turtle = new Turtle();

turtle.request('http://google.com').then(console.log);