'use strict';

const Redis = require("ioredis");
const fetch = require("node-fetch");
const { performance } = require("perf_hooks");
const client = new Redis(process.env.REDIS_REST_URL);
module.exports.load = async (event) => {
    let section = process.env.SECTION;
    let start = performance.now();
    let url = process.env.REDIS_REST_ENDPOINT +"zrevrange/"+section+"/0/9\?_token\=" + process.env.REDIS_REST_TOKEN;
    let data = await fetch(url)
    let dd = (await data.json()).result
    let items = []
    for(let i = 0; i < dd.length; i++) {
        items.push(JSON.parse(dd[i]));
    }
    // response is ready so we can set the latency
    let latency = performance.now() - start;
    // we are setting random scores to top-10 items to simulate real time dynamic data
    for(let i = 0; i < dd.length; i++) {
        let view_count = Math.floor(Math.random() * 1000);
        await client.zadd(section, view_count, dd[i]);
    }
    // pushing the latency to the histogram
    const client2 = new Redis(process.env.LATENCY_REDIS_URL);
    await client2.lpush("histogram-redisrest", latency)
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
