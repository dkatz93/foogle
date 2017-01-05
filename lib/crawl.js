const RequestTurtle = require('request-turtle');
const { db, Page, Domain, QueueItem } = require('../models');
const cheerio = require('cheerio');
const turtle = new RequestTurtle({ limit: 300 });
const crawlParser = require('./crawlParser')

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
      const parsedData = crawlParser(html);
      return Promise.all([
        parsedData,
        findOrCreatePage({
          title: parsedData.title,
          uri: queueItem.uri,
          keywords: parsedData.keywords,
        }),
        queueItem
      ]);
    })
    .then(grossArray => {
      console.log("GROSSDAYA", grossArray[1])
      const [ parsedData, page, queueItem ] = grossArray;
      if(queueItem.pageId) {
        grossArray.push(addLink('outbound', queueItem.pageId, page))
        grossArray.push(addLink('inbound', queueItem.pageId, page))
      }
      return Promise.all(grossArray);
    })
    .then(grossArray => {
      const [ parsedData, page ] = grossArray;
      const links = parsedData.links;
      return Promise.all(
        links
          .map(link => QueueItem.enqueue({
            uri: link,
            pageId: page.id
          }))
      )
    })
}

 
module.exports = crawl;


