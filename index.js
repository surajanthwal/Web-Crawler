var request = require('request');
var fs = require('fs');

var csvWriter = require('csv-write-stream');
var writer = csvWriter({sendHeaders: false});
writer.pipe(fs.createWriteStream('out.csv'));
var maxConcurrentRequets = 5;
var index = 0;
var actualLinks = [];
var mySet = new Set();


request('https://medium.com/', function (error, response, body) {
    links = body.split("href=");
    for (var i in links) {
        var sample = links[i].substring(0, links[i].indexOf(" "));
        addingLinksToActualLinksArray(sample);
    }
    createFiveConcurrentConnection();
});


function createFiveConcurrentConnection() {
    index = 0;
    for (var i = 0; i < maxConcurrentRequets; i++) {
        getNextLink();
    }
}


function getNextLink() {
    index++;
    if (index >= actualLinks.size) {
        console.log("nothing else to do for this worker");
        writer.end();
        return;
    }
    request(actualLinks[index], function (error, response, body) {
        body = body.split("href=");
        for (var i in body) {
            var sample = body[i].substring(0, body[i].indexOf(" "));
            addingLinksToActualLinksArray(sample);
        }
        getNextLink();
    });
}

function addingLinksToActualLinksArray(sample) {
    sample = sample.substring(1, sample.length - 1);
    if (sample.indexOf("https://medium.com") != -1) {
        if (sample.indexOf(">") != -1) {
            sample = sample.substring(0, sample.indexOf(">") - 1);
        }
        if (!mySet.has(sample)) {
            mySet.add(sample);
            actualLinks.push(sample);
            writer.write({link: sample});
        }
    }
}
