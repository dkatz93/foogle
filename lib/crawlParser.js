const cheerio = require('cheerio');
const RequestTurtle = require('request-turtle');

const turtle = new RequestTurtle({limit: 300});

const genericWords = ["a", "the", "as", "is", "it", "for", "or", "from", "but", "if"];



function crawlparser (res) {
    const $ = cheerio.load(res);
    const siteData = {};
    siteData.links = linkParser($);
    siteData.headings = headingParser($); 
    siteData.keywords = wordParser($);
    siteData.title = $('head title').text();
    return siteData;
}

function linkParser($, res){
    const links = [];
    $('a').each(function(i, elem){
        let href = $(this).prop('href');
        if (!href.match(/^(#|$|\/)/)){
            links.push(href)
        }
    })
    return links;
}

function headingParser($){
    const headings = {};
    $('h1, h2, h3, h4, h5, h6').each(function(i, elem){
        const tagname = $(this).get(0).tagName;
        if(!headings[tagname]) headings[tagname]=[];
        headings[tagname].push($(this).text());
    })
    return headings;
}

function wordParser($, threshold){
    const keywords = {};
    const words = $('body').text().replace(/\r?\n/g, "").split(/\.\s?\s+/).reduce((prev, sentence) => {
        if (!sentence.length){
            return prev
        }
        sentence[0] = sentence[0].toLowerCase();
        return [...prev, ...sentence.split(/\s+/)]
    }, []);
   
    
    words.forEach((word) => {
        word = word.replace(/([^a-z0-9-'])/gi, "").toLowerCase();
        if (genericWords.indexOf(word.toLowerCase()) === -1){
                if(!keywords[word]) keywords[word]=1;
                else keywords[word]++;
        }
    })
    Object.keys(keywords).forEach(word => {
        if (keywords[word] < threshold){
            delete keywords[word]
        }
    })        
    return Object.keys(keywords);
    

}


module.exports = crawlparser;
