
const admin = require('firebase-admin');
const { performance } = require("perf_hooks");
const Redis = require("ioredis");

admin.initializeApp();
const db = admin.firestore();


exports.loadNews = async(req, res) => {
    let start = performance.now();
    const snapshot = await db.collection("news").where('section', '==', 'World')
        .orderBy('view_count', 'desc').limit(10).get();
    let latency = performance.now() - start;

    snapshot.forEach(doc => {
        let view_count = Math.floor(Math.random() * 1000);
        const newsRef = db.collection('news').doc(doc.id);
        newsRef.update({view_count: view_count});
    });

    const client = new Redis(process.env.LATENCY_REDIS_URL);
    await client.lpush("histogram-firestore", latency, (resp) => {
        client.quit();
    })

    if (snapshot.empty) {
        console.log('No matching documents.');
        res.send('No matching documents.');
    } else {
        var docs = snapshot.docs.map(doc => doc.data());
        res.set('Access-Control-Allow-Origin', "*")
        res.set('Access-Control-Allow-Credentials', true);
        res.json({ latency: latency, data : {Items: docs } });
    }
};


// gcloud config set project functions-317005
// gcloud functions deploy loadNews --runtime nodejs14 --trigger-http --allow-unauthenticated