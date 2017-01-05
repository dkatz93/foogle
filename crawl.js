const RequestTurtle = require('request-turtle');
const { db, Page, Domain, QueueItem } = require('./models');
const cheerio = require('cheerio');
const turtle = new RequestTurtle({ limit: 300 });

function findOrCreatePage(params) {
  return Page.findOrCreate({ where: params })
    .then(results => results[0])
}

function addLink(direction, origin, destination) {
  const methodNames = {
    inbound: {
      getLinks: 'getInboundLinks',
      addLink: 'addInboundLink'
    },
    outbound: {
      getLinks: 'getOutboundLinks',
      addLink: 'addOutboundLink'
    }
  }[direction];

  return Page.findById(origin)
    .then(origin => { 
      return origin[methodNames.getLinks]({
        where: {
          uri: destination.uri
        },
        limit: 1
      })
    })
    .then(link => {
      return link[0] || origin[methodNames.addLink](destination)
    })
}

function findLinks($) {
  return Array.from($('a'))
    .map(anchor => anchor.attribs.href)
    .filter(link => link && link.startsWith('http'))
  // [uri, uri, uri]
}


function crawl() {
  return QueueItem.dequeue()
    .then(queueItem => {
      return Promise.all([
        turtle.request({
          method: 'GET',
          uri: queueItem.uri
        }),
        queueItem
      ])
    })
    .then(grossArray => {
      const [ html, queueItem ] = grossArray;
      const $ = cheerio.load(html);
      return Promise.all([
        $,
        findOrCreatePage({
          title: $('title').text(),
          uri: queueItem.uri,
          textContent: $('body').text(),
        }),
        queueItem
      ]);
    })
    .then(grossArray => {
      const [ $, page, queueItem ] = grossArray;
      if(queueItem.pageId) {
        grossArray.push(addLink('outbound', queueItem.pageId, page))
        grossArray.push(addLink('inbound', queueItem.pageId, page))
      }
      return Promise.all(grossArray);
    })
    .then(grossArray => {
      const [ $, page ] = grossArray;
      const links = findLinks($);
      return Promise.all(
        links
          .map(link => QueueItem.enqueue({
            uri: link,
            pageId: page.id
          }))
      )
    })
    .then(() => process.exit(0));
}

db.sync({ force: false })
  .then(() => QueueItem.enqueue({
    uri: 'http://fullstackacademy.com'
  }))
  .then(() => crawl())
  .catch(() => process.exit(1));




