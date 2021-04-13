const fs = require("fs");
const faunadb = require("faunadb");

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET
})

const news = JSON.parse(fs.readFileSync('news.json', 'utf8')).response.docs;
const len = news.length;

console.log(len)
let count = 0;
for (i = 0; i < len; i++) {
    let item = {}
    let view_count = Math.floor(Math.random() * 1000);
    let section = news[i].section_name;
    item.id = i + 1;
    item.section = section;
    item.headline = news[i].headline.main;
    item.abstract = news[i].abstract;
    item.view_count = view_count;
    item.url = news[i].web_url;
    if (news[i].multimedia && news[i].multimedia.length > 0) {
        item.image = "https://www.nytimes.com/" + news[i].multimedia[0].url
    } else {
        item.image = "https://www.nytimes.com/vi-assets/static-assets/ios-ipad-144x144-28865b72953380a40aa43318108876cb.png";
    }

    (async () => {
    client.query(q.Create(q.Collection("news"), { data: item } ))
        .then((response) => {
            console.log("success", response)
            count++;
            console.log(len);
        }).catch((error) => {
        console.log("error", error)
    })
    })();
}


