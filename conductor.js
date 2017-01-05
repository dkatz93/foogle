const crawl = require('./lib/crawl');
const db = require('./models').db;
const QueueItem = require('./models').QueueItem;

function conductor () {
   
    const arr = [];
    for (let i = 0; i < 1; i++){
        arr.push(crawl())
    }
        Promise.all(arr)
        .then(() => {
            conductor();
        })
}

db.sync({ force: true })
  .then(() => QueueItem.enqueue({
    uri: 'http://fullstackacademy.com'
  }))
    .then(()=> crawl())
    .then(() => conductor())
    .catch((error) => {
        console.log(error)
        process.exit(1)
    });
