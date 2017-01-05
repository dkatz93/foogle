const cheerio = require('cheerio');
const RequestTurtle = require('request-turtle');

const turtle = new RequestTurtle({limit: 300});

const genericWords = ["a", "the", "as", "is", "it", "for", "or", "from", "but", "if"];

turtle.request({method: "GET", uri: "http://fullstackacademy.com", resolveWithFullResponse: true})
    .then((res) => {
    const $ = cheerio.load(res.body);
    console.log(wordParser($, 3))
    
    });

function crawlparser (res) {
    const $ = cheerio.load(res.body);
    const siteData = {};
    siteData.links = linkParser($, res);
    siteData.headings = headingParser($); 
    siteData.keywords = wordParser($);
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
        console.log("WORD", word)
        if (keywords[word] < threshold){
            delete keywords[word]
        }
    })        
    return keywords;
    

}


module.exports = crawlparser;
