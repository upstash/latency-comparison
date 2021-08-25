// Import the MongoDB driver
const MongoClient = require("mongodb").MongoClient;
const { performance } = require("perf_hooks");
const Redis = require("ioredis");

// Once we connect to the database once, we'll store that connection and reuse it so that we don't have to connect to the database on every request.
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    // Connect to our MongoDB database hosted on MongoDB Atlas
    const client = await MongoClient.connect(process.env.MONGO_URL);

    // Specify which database we want to use
    const db = await client.db("news");

    cachedDb = db;
    return db;
}

module.exports.load = async (event, context) => {

    /* By default, the callback waits until the runtime event loop is empty before freezing the process and returning the results to the caller. Setting this property to false requests that AWS Lambda freeze the process soon after the callback is invoked, even if there are events in the event loop. AWS Lambda will freeze the process, any state data, and the events in the event loop. Any remaining events in the event loop are processed when the Lambda function is next invoked, if AWS Lambda chooses to use the frozen process. */
    context.callbackWaitsForEmptyEventLoop = false;

    // Get an instance of our database
    const db = await connectToDatabase();

    let start = performance.now();
    // Make a MongoDB MQL Query to go into the movies collection and return the first 20 movies.
    const news = await db.collection("news").find({"section":"World"}).sort({"view_count":-1}).limit(10).toArray();
    let latency = performance.now() - start;

    news.forEach(item =>{
        let view_count = Math.floor(Math.random() * 1000);
        db.collection("news").updateOne(
            {"_id" : item._id},
            {$set: { "view_count" : view_count}});
    } );

    const client = new Redis(process.env.LATENCY_REDIS_URL);
    await client.lpush("histogram-mongo", latency, (resp) => {
        client.quit();
    })

    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            latency: latency,
            data: {Items: news},
        }),
    };

    return response;
};