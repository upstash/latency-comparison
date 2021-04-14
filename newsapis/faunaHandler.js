'use strict';

const faunadb = require("faunadb");
const Redis = require("ioredis");
const { performance } = require("perf_hooks");
const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET,
    keepAlive: true
})
const section = process.env.SECTION;

module.exports.load = async (event) => {
    let start = performance.now();
    let ret = await client.query(
        // the below is Fauna API for "select from news where section = 'world' order by view_count limit 10"
        q.Map(q.Paginate(q.Match(q.Index('section_by_view_count'), section), {size: 10}), q.Lambda(["view_count", "X"], q.Get(q.Var("X"))))
    ).catch((err) => console.error('Error: %s', err))
    // response is ready so we can set the latency
    let latency = performance.now() - start;
    const rclient = new Redis(process.env.LATENCY_REDIS_URL);
    await rclient.lpush("histogram-fauna", latency)
    await rclient.quit();

    let result = [];
    for (let i = 0; i < ret.data.length; i++) {
        result.push(ret.data[i].data)
    }

    // we are setting random scores to top-10 items asynchronously to simulate real time dynamic data
    /*  Evan Weaver suggested to skip this section. https://news.ycombinator.com/item?id=26799074
    ret.data.forEach((item) => {
        let view_count = Math.floor(Math.random() * 1000);
        client.query(
            q.Update(
                q.Ref(q.Collection('news'), item["ref"].id),
                {data: {view_count}},
            )
        ).catch((err) => console.error('Error: %s', err))
    })
     */

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            latency: latency,
            data: {
                Items: result
            },
        })
    };
};