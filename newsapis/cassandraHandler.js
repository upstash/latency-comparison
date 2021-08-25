'use strict';

const Redis = require("ioredis");
const fetch = require("node-fetch");
const { performance } = require("perf_hooks");

module.exports.load = async (event) => {
    let start = performance.now();
    let url = 'https://5864e932-14a7-4335-8d84-16f40e451b5b-us-east-1.apps.astra.datastax.com/api/rest/v2/keyspaces/news/items?page-size=10&sort={"view_count":"desc"}&view_count&where={"section":{"$eq":"World"}}';
    let data = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json',
            'x-cassandra-token': process.env.CASSANDRA_TOKEN
        }
    })
    data = await data.json()
    let dd = data.data
    let items = []
    for(let i = 0; i < dd.length; i++) {
        items.push(dd[i]);
    }
    // response is ready so we can set the latency
    let latency = performance.now() - start;

    
    // pushing the latency to the histogram
    const client2 = new Redis(process.env.LATENCY_REDIS_URL);
    await client2.lpush("histogram-cassandra", latency)
    await client2.quit();

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify( {
            latency: latency,
            data: {
                Items: items
            },
        })
    };
};
