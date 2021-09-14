'use strict';

const Redis = require("ioredis");
const hdr = require("hdr-histogram-js");

module.exports.load = async (event) => {
    const client = new Redis(process.env.LATENCY_REDIS_URL);
    let dataMongo = await client.lrange("histogram-mongo", 0, 10000)
    let dataFirestore = await client.lrange("histogram-firestore", 0, 10000)
    let dataCassandra = await client.lrange("histogram-cassandra", 0, 10000)
    let dataRedis = await client.lrange("histogram-redis", 0, 10000)
    let dataRedismz = await client.lrange("histogram-redismz", 0, 10000)
    let dataRedisrest = await client.lrange("histogram-redisrest", 0, 10000)
    let dataDynamo = await client.lrange("histogram-dynamo", 0, 10000)
    let dataFauna = await client.lrange("histogram-fauna", 0, 10000)
    let dataFaunaUs = await client.lrange("histogram-fauna-us", 0, 10000)
    let dataGlobal = await client.lrange("histogram-global", 0, 10000)
    let dataEdgeE = await client.lrange("histogram-edgeEnabled", 0, 10000)
    let dataEdgeD = await client.lrange("histogram-edgeDisabled", 0, 10000)
    const hmongo = hdr.build();
    const hfirestore = hdr.build();
    const hcassandra = hdr.build();
    const hredis = hdr.build();
    const hredismz = hdr.build();
    const hredisrest = hdr.build();
    const hdynamo = hdr.build();
    const hfauna = hdr.build();
    const hfaunaus = hdr.build();
    const hglobal = hdr.build();
    const hedgee = hdr.build();
    const hedged = hdr.build();
    dataRedis.forEach(item => {
        hredis.recordValue(item);
    })
    dataCassandra.forEach(item => {
        hcassandra.recordValue(item);
    })
    dataMongo.forEach(item => {
        hmongo.recordValue(item);
    })
    dataFirestore.forEach(item => {
        hfirestore.recordValue(item);
    })
    dataRedismz.forEach(item => {
        hredismz.recordValue(item);
    })
    dataRedisrest.forEach(item => {
        hredisrest.recordValue(item);
    })
    dataDynamo.forEach(item => {
        hdynamo.recordValue(item);
    })
    dataFauna.forEach(item => {
        hfauna.recordValue(item);
    })
    dataFaunaUs.forEach(item => {
        hfaunaus.recordValue(item);
    })
    dataGlobal.forEach(item => {
        hglobal.recordValue(item);
    })
    dataEdgeE.forEach(item => {
        hedgee.recordValue(item);
    })
    dataEdgeD.forEach(item => {
        hedged.recordValue(item);
    })
    await client.quit();
    hredis.maxValue = null
    hmongo.maxValue = null
    hfirestore.maxValue = null
    hcassandra.maxValue = null
    hredismz.maxValue = null
    hredisrest.maxValue = null
    hfauna.maxValue = null
    hfaunaus.maxValue = null
    hglobal.maxValue = null
    hdynamo.maxValue = null
    hedgee.maxValue = null
    hedged.maxValue = null
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(
            {
                redis_min: hredis.minNonZeroValue,
                mongo_min: hmongo.minNonZeroValue,
                firestore_min: hfirestore.minNonZeroValue,
                cassandra_min: hcassandra.minNonZeroValue,
                redismz_min: hredismz.minNonZeroValue,
                redisrest_min: hredisrest.minNonZeroValue,
                dynamo_min: hdynamo.minNonZeroValue,
                fauna_min: hfauna.minNonZeroValue,
                faunaus_min: hfaunaus.minNonZeroValue,
                global_min: hglobal.minNonZeroValue,
                edgee_min: hedgee.minNonZeroValue,
                edged_min: hedged.minNonZeroValue,
                redis_mean: hredis.mean,
                mongo_mean: hmongo.mean,
                firestore_mean: hfirestore.mean,
                cassandra_mean: hcassandra.mean,
                redismz_mean: hredismz.mean,
                redisrest_mean: hredisrest.mean,
                dynamo_mean: hdynamo.mean,
                fauna_mean: hfauna.mean,
                faunaus_mean: hfaunaus.mean,
                global_mean: hglobal.mean,
                edgee_mean: hedgee.mean,
                edged_mean: hedged.mean,
                redis_histogram: hredis,
                mongo_histogram: hmongo,
                firestore_histogram: hfirestore,
                cassandra_histogram: hcassandra,
                redismz_histogram: hredismz,
                redisrest_histogram: hredisrest,
                dynamo_histogram: hdynamo,
                fauna_histogram: hfauna,
                faunaus_histogram: hfaunaus,
                global_histogram: hglobal,
                edgee_histogram: hedgee,
                edged_histogram: hedged,
            },
            null,
            2
        )
    };
};
