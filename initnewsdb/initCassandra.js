const fetch = require("node-fetch");
const fs = require("fs");


const ASTRA_DB_ID = '5864e932-14a7-4335-8d84-16f40e451b5b'
const ASTRA_DB_REGION = 'us-east-1'
const ASTRA_DB_KEYSPACE = 'news'
const ASTRA_DB_APPLICATION_TOKEN = '<app_token>'

/*

curl --request POST \
    --url https://${ASTRA_DB_ID}-${ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v1/keyspaces/${ASTRA_DB_KEYSPACE}/tables/rest_example_products/rows \
    --header 'content-type: application/json' \
    --header "x-cassandra-token: ${ASTRA_DB_APPLICATION_TOKEN}" \
    --data '{"columns":[{"name":"id","value":"e9b6c02d-0604-4bab-a3ea-6a7984654631"},{"name":"productname","value":"Heavy Lift Arms"},{"name":"description","value":"Heavy lift arms capable of lifting 1,250 lbs of weight per arm. Sold as a set."},{"name":"price","value":"4199.99"},{"name":"created","value":"2019-01-10T09:48:31.020Z"}]}'

INSERT INTO news.temp (id, section, headline,
  abstract,
  url,
  image,
  view_count)
  VALUES (2, 'world','h1', 'abs', 'url', 'img', 100);


 */

const url = "https://5864e932-14a7-4335-8d84-16f40e451b5b-us-east-1.apps.astra.datastax.com/api/rest/v1/keyspaces/news/tables/items/rows"


async function insert(id, section, headline, abstract, newsurl, image, view_count) {

    let data = `{"columns":[ {"name":"id","value":${id}},`
        + `{"name":"section","value":"${section}"},`
        + `{"name":"headline","value":"${headline}"},`
        + `{"name":"abstract","value":"${abstract}"},`
        + `{"name":"url","value":"${newsurl}"},`
        + `{"name":"image","value":"${image}"},`
        + `{"name":"view_count","value":${view_count}}]}`;
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            'x-cassandra-token': process.env.CASSANDRA_TOKEN
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: data // body data type must match "Content-Type" header
    });
    return id
}


async function main() {
    const news = JSON.parse(fs.readFileSync('news.json', 'utf8')).response.docs;
    const len = news.length;
// insert(67, "world", "Heavy Lift Arms", "Heavy Lift Arms abs", "htps://dddd", "image", 178 );
    for (i = 0; i < len; i++) {
        let headline = news[i].headline.main;
        let abstract = news[i].abstract;
        let newsurl = news[i].web_url;
        let section = news[i].section_name;
        let image
        if (news[i].multimedia && news[i].multimedia.length > 0) {
            image = "https://www.nytimes.com/" + news[i].multimedia[0].url
        } else {
            image = "https://www.nytimes.com/vi-assets/static-assets/ios-ipad-144x144-28865b72953380a40aa43318108876cb.png";
        }
        let id = i + 1;
        let view_count = Math.floor(Math.random() * 1000);
        // setTimeout(function(){ insert(id, section, headline, abstract, newsurl, image, view_count ); }, 1100 * i );
        console.log(await (insert(id, section, headline, abstract, newsurl, image, view_count)))
    }
}

main();