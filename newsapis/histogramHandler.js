'use strict';

const Redis = require("ioredis");
const hdr = require("hdr-histogram-js");

module.exports.load = async (event) => {
    const client = new Redis(process.env.LATENCY_REDIS_URL);
    let dataRedis = await client.lrange("histogram-redis", 0, 10000)
    let dataDynamo = await client.lrange("histogram-dynamo", 0, 10000)
    let dataFauna = await client.lrange("histogram-fauna", 0, 10000)
    const hredis = hdr.build();
    const hdynamo = hdr.build();
    const hfauna = hdr.build();
    dataRedis.forEach(item => {
        hredis.recordValue(item);
    })
    dataDynamo.forEach(item => {
        hdynamo.recordValue(item);
    })
    dataFauna.forEach(item => {
        hfauna.recordValue(item);
    })
    await client.quit();
    hredis.maxValue = null
    hfauna.maxValue = null
    hdynamo.maxValue = null
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(
            {
                redis_min: hredis.minNonZeroValue,
                dynamo_min: hdynamo.minNonZeroValue,
                fauna_min: hfauna.minNonZeroValue,
                redis_mean: hredis.mean,
                dynamo_mean: hdynamo.mean,
                fauna_mean: hfauna.mean,
                redis_histogram: hredis,
                dynamo_histogram: hdynamo,
                fauna_histogram: hfauna,
            },
            null,
            2
        )
    };
};
