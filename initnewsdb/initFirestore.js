const fs = require("fs");
const admin = require('firebase-admin');

const news = JSON.parse(fs.readFileSync('news.json', 'utf8')).response.docs;
const len = news.length;

const collectionName = "news"

async function main() {

    const serviceAccount = require('./functions-317005-firebase-adminsdk-coziy-8514812b2d.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();

    const snapshot = await db.collection(collectionName).where('section', '==', 'World')
        .orderBy('view_count', 'desc').limit(10).get();
    if (snapshot.empty) {
        console.log('No matching documents.');
        return;
    } else {
        var docs = snapshot.docs.map(doc => doc.data());
        console.log('Document data:', docs);
        let x= JSON.stringify(docs);
        // console.log("jjj" + x);
    }

    snapshot.forEach(doc => {
        // console.log(doc.id, '=>', doc.data());
    });

    for (i = 0; i < 0; i++) {
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

        if (section !== "WorldXXX") {
            let id = i + 1;
            let view_count = Math.floor(Math.random() * 1000);

            var obj = {
                url: url,
                headline: headline,
                abstract: abstract,
                image: image,
                section: section,
                view_count: view_count
            };
            const res = await db.collection(collectionName).doc(id + "").set(obj);

            console.log(id)
            console.log(res)
        }
    }
}

main();
