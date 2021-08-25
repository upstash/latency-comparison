'use strict';

const Redis = require("ioredis");
const { performance } = require("perf_hooks");
const client = new Redis(process.env.REDIS_MZ_URL);
module.exports.load = async (event) => {
    let section = process.env.SECTION;
    let start = performance.now();
    let data = await client.zrevrange(section, 0, 9)
    let items = []
    for(let i = 0; i < data.length; i++) {
        items.push(JSON.parse(data[i]));
    }
    // response is ready so we can set the latency
    let latency = performance.now() - start;
    // we are setting random scores to top-10 items to simulate real time dynamic data
    for(let i = 0; i < data.length; i++) {
        let view_count = Math.floor(Math.random() * 1000);
        await client.zadd(section, view_count, data[i]);
    }
    // await client.quit();
    // pushing the latency to the histogram
    const client2 = new Redis(process.env.LATENCY_REDIS_URL);
    await client2.lpush("histogram-redismz", latency)
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
