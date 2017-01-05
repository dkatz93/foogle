const express = require('express')
const router = require('./routes')
const bodyParser = require('body-parser')
const db = require('./models')


app.use(bodyParser.urlencoded({ extended:true})); 
app.use(bodyParser.json());


app.use(express.static('public'))

app.use('/', router)

app.use((err, req, res, next) => {
	console.error(err)
	res.status(err.status || 500)
	.send(err)
})


db.sync()
	.then(function() {
		app.listen(3003, function() {
		  console.log('listening on port 3003');
		});
	})
	.catch(function(err) {
		console.log('there was a problem...', err);
})


module.exports = app