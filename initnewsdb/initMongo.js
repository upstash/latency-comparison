const {MongoClient} = require('mongodb');
const fs = require("fs");

const uri = process.env.MONGO_URL;

const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
const news = JSON.parse(fs.readFileSync('news.json', 'utf8')).response.docs;
const len = news.length;

client.connect(err => {
    if (err) {
        console.log(err)
        return
    }
    const collection = client.db("news").collection("news");

    for (i = 0; i < len; i++) {
        let headline = news[i].headline.main;
        let abstract = news[i].abstract;
        let url = news[i].web_url;
        let section = news[i].section_name;
        let image
        if (news[i].multimedia && news[i].multimedia.length > 0) {
            image = "https://www.nytimes.com/" + news[i].multimedia[0].url
        } else {
            image = "https://www.nytimes.com/vi-assets/static-assets/ios-ipad-144x144-28865b72953380a40aa43318108876cb.png";
        }
        let id = i + 1;
        let view_count = Math.floor(Math.random() * 1000);

        var obj = {
            id: id,
            url: url,
            headline: headline,
            abstract: abstract,
            image: image,
            section: section,
            view_count: view_count
        };
        collection.insertOne(obj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted:" + id);
        })
    }
});

console.log(len)
