const fs = require("fs");

const AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-1"
});

const docClient = new AWS.DynamoDB.DocumentClient();

const news = JSON.parse(fs.readFileSync('news.json', 'utf8')).response.docs;
const len = news.length;



for(i = 0; i < len; i++) {
    let headline = news[i].headline.main;
    let abstract = news[i].abstract;
    let url = news[i].web_url;
    let section = news[i].section_name;
    let image
    if(news[i].multimedia && news[i].multimedia.length > 0) {
        image = "https://www.nytimes.com/" + news[i].multimedia[0].url
    }
    else {
        image = "https://www.nytimes.com/vi-assets/static-assets/ios-ipad-144x144-28865b72953380a40aa43318108876cb.png";
    }
    let id = i+1;
    let view_count = Math.floor(Math.random() * 1000);

    var params = {
        TableName: "news",
        Item: {
            id:  id,
            url:  url,
            headline:  headline,
            abstract: abstract,
            image: image,
            section: section,
            view_count: view_count
        }
    };

    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add news", url, ". Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("PutItem succeeded:", url, id);
        }
    });

}
console.log(len)

             