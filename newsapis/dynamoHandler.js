'use strict';

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-1"
});
const https = require('https');
const agent = new https.Agent({
    keepAlive: true,
    maxSockets: Infinity
});

AWS.config.update({
    httpOptions: {
        agent
    }
});

const Redis = require("ioredis");
const { performance } = require("perf_hooks");
const tableName = "news";
var params = {
    TableName: tableName,
    IndexName: "section-view_count-index",
    KeyConditionExpression: "#sect = :section",
    ExpressionAttributeNames: {
        "#sect": "section"
    },
    ExpressionAttributeValues: {
        ":section": process.env.SECTION
    },
    Limit: 10,
    ScanIndexForward: false,
};
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.load =  (event, context, callback) => {
    let start = performance.now();
    docClient.query(params, (err, result) => {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // response is ready so we can set the latency
            let latency = performance.now() - start;
            let response = {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
                body: JSON.stringify(
                    {
                        latency: latency,
                        data: result,
                    }
                )
            };
            // we are setting random score to top-10 items to simulate real time dynamic data
            result.Items.forEach(item =>{
                let view_count = Math.floor(Math.random() * 1000);
                var params2 = {
                    TableName:tableName,
                    Key:{
                        "id": item.id,
                    },
                    UpdateExpression: "set view_count = :r",
                    ExpressionAttributeValues:{
                        ":r":view_count
                    },
                };
                docClient.update(params2, function(err, data) {
                    if (err) {
                        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                    }
                });
            } );
            // pushing the latency to the histogram
            const client = new Redis(process.env.LATENCY_REDIS_URL);
            client.lpush("histogram-dynamo", latency, (resp) => {
                client.quit();
                callback(null, response)
            })
        }
    });
};
