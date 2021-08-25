import './App.css';
import {useEffect, useState} from "react";
import {Chart} from "react-google-charts";


function App() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [redisLatency, setRedisLatency] = useState("?");
    const [redismzLatency, setRedismzLatency] = useState("?");
    const [redisrestLatency, setRedisrestLatency] = useState("?");
    const [dynamoLatency, setDynamoLatency] = useState("?");
    const [mongoLatency, setMongoLatency] = useState("?");
    const [firestoreLatency, setFirestoreLatency] = useState("?");
    const [faunaLatency, setFaunaLatency] = useState("?");
    const [cassandraLatency, setCassandraLatency] = useState("?");
    const [latency50, setLatency50] = useState({redis: "?", dynamo: "?", fauna: "?", redismz: "?", redisrest: "?", mongo: "?", cassandra: "?", firestore: "?"});
    const [latency99, setLatency99] = useState({redis: "?", dynamo: "?", fauna: "?", redismz: "?", redisrest: "?", mongo: "?", cassandra: "?", firestore: "?"});
    const [latency999, setLatency999] = useState({redis: "?", dynamo: "?", fauna: "?", redismz: "?", redisrest: "?", mongo: "?", cassandra: "?", firestore: "?"});
    const [items, setItems] = useState([]);
    const apiUrl = "https://nlm8ixxhud.execute-api.us-west-1.amazonaws.com/dev/"
    const apiUrlEast = "https://0s3ykqdj7a.execute-api.us-east-1.amazonaws.com/dev/"
    const apiUrlGCP = "https://us-central1-functions-317005.cloudfunctions.net/loadNews"

    function refreshPage() {
        window.location.reload(true);
    }

    useEffect(() => {
        let temp = []
        const promises = []
        promises.push(fetch(apiUrl + "redis")
            .then(res => res.json())
            .then(
                (result) => {
                    temp = temp.concat(result.data.Items)
                    setRedisLatency(result.latency)
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            ))
        promises.push(fetch(apiUrl + "redismz")
            .then(res => res.json())
            .then(
                (result) => {
                    temp = temp.concat(result.data.Items)
                    setRedismzLatency(result.latency)
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            ))
        promises.push(fetch(apiUrl + "redisrest")
            .then(res => res.json())
            .then(
                (result) => {
                    temp = temp.concat(result.data.Items)
                    setRedisrestLatency(result.latency)
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            ))
        promises.push(fetch(apiUrl + "fauna")
            .then(res => res.json())
            .then(
                (result) => {
                    temp = temp.concat(result.data.Items)
                    setFaunaLatency(result.latency)
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            ))
        promises.push(fetch(apiUrl + "dynamo")
            .then(res => res.json())
            .then(
                (result) => {
                    temp = temp.concat(result.data.Items)
                    setDynamoLatency(result.latency)
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            ))
        promises.push(fetch(apiUrlEast + "mongo")
            .then(res => res.json())
            .then(
                (result) => {
                    temp = temp.concat(result.data.Items)
                    setMongoLatency(result.latency)
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            ))
        promises.push(fetch(apiUrlGCP)
            .then(res => res.json())
            .then(
                (result) => {
                    temp = temp.concat(result.data.Items)
                    setFirestoreLatency(result.latency)
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            ))
        promises.push(fetch(apiUrlEast + "cassandra")
            .then(res => res.json())
            .then(
                (result) => {
                    temp = temp.concat(result.data.Items)
                    setCassandraLatency(result.latency)
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            ))
        fetch(apiUrl + "histogram")
            .then(res => res.json())
            .then(
                (result) => {
                    setLatency50({
                        redis: result.redis_histogram.p50,
                        redismz: result.redismz_histogram.p50,
                        redisrest: result.redisrest_histogram.p50,
                        dynamodb: result.dynamo_histogram.p50,
                        mongo: result.mongo_histogram.p50,
                        firestore: result.firestore_histogram.p50,
                        cassandra: result.cassandra_histogram.p50,
                        fauna: result.fauna_histogram.p50
                    })
                    setLatency99({
                        redis: result.redis_histogram.p99,
                        redismz: result.redismz_histogram.p99,
                        redisrest: result.redisrest_histogram.p99,
                        dynamodb: result.dynamo_histogram.p99,
                        mongo: result.mongo_histogram.p99,
                        firestore: result.firestore_histogram.p99,
                        cassandra: result.cassandra_histogram.p99,
                        fauna: result.fauna_histogram.p99
                    })
                    setLatency999({
                        redis: result.redis_histogram.p99_9,
                        redismz: result.redismz_histogram.p99_9,
                        redisrest: result.redisrest_histogram.p99_9,
                        dynamodb: result.dynamo_histogram.p99_9,
                        mongo: result.mongo_histogram.p99_9,
                        firestore: result.firestore_histogram.p99_9,
                        cassandra: result.cassandra_histogram.p99_9,
                        fauna: result.fauna_histogram.p99_9
                    })
                }
            )
        Promise.all(promises).then(() => {
                setIsLoaded(true);
                setItems(temp)
            }
        )
    }, [])


    let news;
    if (error) {
        news = <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        news = <div>Loading...</div>;
    } else {
        news = (
            <div className="container">
                {items.map(item => (
                    <div className="row newsDiv">
                        <div className="col-lg-3">
                            <img src={item.image} className="newsImage" align="left"/>
                        </div>
                        <div className="col-lg-9">
                            <a href={item.url} target="_blank" rel="noreferrer">
                                {item.headline}
                            </a>
                            <br/>
                            {item.abstract}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return (
        <div className="intro">
            <h3>Live Latency Comparison Among Serverless Databases </h3>
            This single page application compares the latencies of leading serverless databases (
            <a rel="noreferrer" href="https://aws.amazon.com/dynamodb/" target="_blank">
                DynamoDB,
            </a>
            {" "}
            <a rel="noreferrer" href="https://www.mongodb.com/" target="_blank">
                MongoDB (Atlas),
            </a>
            {" "}
            <a rel="noreferrer" href="https://firebase.google.com/products/firestore" target="_blank">
                Firestore,
            </a>
            {" "}
            <a rel="noreferrer" href="https://www.datastax.com/products/datastax-astra" target="_blank">
                Cassandra (Datastax Astra),
            </a>
            {" "}
            <a rel="noreferrer" href="https://fauna.com/" target="_blank">
                FaunaDB,
            </a>
            {" "}
            <a href="https://upstash.com/" target="_blank">
                Redis (Upstash)
            </a>)
            for a common web usecase.
            <br/>
            <br/>
            I have inserted 7001 news articles into each database. The articles are collected from {' '}
            <a href="https://developer.nytimes.com/docs/archive-product/1/overview" target="_blank">
                New York Times Archive API</a>
            (all articles of January 2021).
            I randomly scored each news article. At each page request, I query top 10
            articles under `World` section from each database.
            <br/>
            <br/>
            I use serverless functions (AWS Lambda) to load the articles from each database. Response time of
            fetching 10 articles is being recorded as latency inside the lambda function.
            <br/>
            <br/>
            Here the latency of the current request:
            <span onClick={refreshPage}  className="reload">
                ⟳
            </span>
            <br/>
            DynamoDB: {Math.round(dynamoLatency)} ms |
            Cassandra: {Math.round(cassandraLatency)} ms |
            Firestore: {Math.round(firestoreLatency)} ms |
            MongoDB: {Math.round(mongoLatency)} ms |
            FaunaDB: {Math.round(faunaLatency)} ms |
            Upstash: {Math.round(redisLatency)} ms |
            Upstash Multizone: {Math.round(redismzLatency)} ms |
            Upstash REST: {Math.round(redisrestLatency)} ms
            <br/>
            <br/>
            See <a href="https://blog.upstash.com/serverless-database-benchmark" rel="noreferrer" target="_blank">the blog post
            </a> for the details.
            <br/>
            <br/>
            <b>The latency numbers so far:</b>
            <br/>
            <br/>
            <div className="container-fluid">
                <div className="row chartRow">
                    <div className="col-11 chartDiv">
                        50th Percentile (latency in milliseconds):
                        <Chart
                            chartType="ColumnChart"
                            loader={<div>Loading Chart</div>}
                            data={[
                                ['Database', 'p50 latency (ms)', {role: 'style'}, {role: 'annotation'}],
                                ['DynamoDB', latency50.dynamodb, "#D96C2D", latency50.dynamodb],
                                ['Cassandra', latency50.cassandra, "#4F97E1", latency50.cassandra],
                                ['Firestore', latency50.firestore, "#469454", latency50.firestore],
                                ['MongoDB', latency50.mongo, "#469454", latency50.mongo],
                                ['FaunaDB', latency50.fauna, "#39059E", latency50.fauna],
                                ['Upstash', latency50.redis, "#6BE5A8", latency50.redis],
                                ['Upstash Multizone', latency50.redismz, "#6BE5A8", latency50.redismz],
                                ['Upstash REST', latency50.redisrest, "#6BE5A8", latency50.redisrest],
                            ]}
                            options={{
                                title: '50 Percentile Latency in Milliseconds',
                                titlePosition: 'none',
                                chartArea: {left: 60, width: '60%'},
                                hAxis: {
                                    minValue: 0,
                                },
                                backgroundColor: '#FAFAFA',
                                legend: {position: 'none'},
                                vAxis: {
                                    title: 'milliseconds',
                                },
                            }}
                        />
                    </div>
                    <div className="col-11 chartDiv">
                        99th Percentile (latency in milliseconds):
                        <Chart
                            chartType="ColumnChart"
                            loader={<div>Loading Chart</div>}
                            data={[
                                ['Database', 'p99 latency (ms)', {role: 'style'}, {role: 'annotation'}],
                                ['DynamoDB', latency99.dynamodb, "#D96C2D", latency99.dynamodb],
                                ['Cassandra', latency99.cassandra, "#4F97E1", latency99.cassandra],
                                ['Firestore', latency99.firestore, "#469454", latency99.firestore],
                                ['MongoDB', latency99.mongo, "#469454", latency99.mongo],
                                ['FaunaDB', latency99.fauna, "#39059E", latency99.fauna],
                                ['Upstash', latency99.redis, "#6BE5A8", latency99.redis],
                                ['Upstash Multizone', latency99.redismz, "#6BE5A8", latency99.redismz],
                                ['Upstash REST', latency99.redisrest, "#6BE5A8", latency99.redisrest],
                            ]}
                            options={{
                                title: '99 Percentile Latency in Milliseconds',
                                titlePosition: 'none',
                                chartArea: {left: 60, width: '60%'},
                                hAxis: {
                                    minValue: 0,
                                },
                                backgroundColor: '#FAFAFA',
                                legend: {position: 'none'},
                                vAxis: {
                                    title: 'milliseconds',
                                },
                            }}
                        />
                    </div>
                    <div className="col-11 chartDiv">
                        99.9th Percentile (latency in milliseconds):
                        <Chart
                            chartType="ColumnChart"
                            loader={<div>Loading Chart</div>}
                            data={[
                                ['Database', 'p99.9 latency (ms)', {role: 'style'}, {role: 'annotation'}],
                                ['DynamoDB', latency999.dynamodb, "#D96C2D", latency999.dynamodb],
                                ['Cassandra', latency999.cassandra, "#4F97E1", latency999.cassandra],
                                ['Firestore', latency999.firestore, "#469454", latency999.firestore],
                                ['MongoDB', latency999.mongo, "#469454", latency999.mongo],
                                ['FaunaDB', latency999.fauna, "#39059E", latency999.fauna],
                                ['Upstash', latency999.redis, "#6BE5A8", latency999.redis],
                                ['Upstash Multizone', latency999.redismz, "#6BE5A8", latency999.redismz],
                                ['Upstash REST', latency999.redisrest, "#6BE5A8", latency999.redisrest],
                            ]}
                            options={{
                                title: '99.9 Percentile Latency in Milliseconds',
                                titlePosition: 'none',
                                chartArea: {left: 60, width: '60%'},
                                hAxis: {
                                    minValue: 0,
                                },
                                backgroundColor: '#FAFAFA',
                                legend: {position: 'none'},
                                vAxis: {
                                    title: 'milliseconds',
                                },
                            }}
                        />
                    </div>
                </div>


            </div>

            <br/>
            See
            <a href={apiUrl + "histogram"} rel="noreferrer"
               className="seelink" target="_blank">
                the full histogram
            </a>
            |
            <a href="https://blog.upstash.com/serverless-database-benchmark" rel="noreferrer" className="seelink" target="_blank">
                the blog post
            </a>
            |
            <a href="https://github.com/upstash/latency-comparison" rel="noreferrer" className="seelink" target="_blank">
                the source code
            </a>
            <br/>
            <hr/>
            Enjoy the news!
            <br/>
            {news}
        </div>
    );
}

export default App;
