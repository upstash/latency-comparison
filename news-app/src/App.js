import './App.css';
import {useEffect, useState} from "react";
import {Chart} from "react-google-charts";


function App() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [redisLatency, setRedisLatency] = useState("?");
    const [dynamoLatency, setDynamoLatency] = useState("?");
    const [faunaLatency, setFaunaLatency] = useState("?");
    const [latency50, setLatency50] = useState({redis: "?", dynamo: "?", fauna: "?"});
    const [latency99, setLatency99] = useState({redis: "?", dynamo: "?", fauna: "?"});
    const [latency999, setLatency999] = useState({redis: "?", dynamo: "?", fauna: "?"});
    const [items, setItems] = useState([]);

    function refreshPage() {
        window.location.reload(true);
    }

    useEffect(() => {
        let temp = []
        const promises = []
        promises.push(fetch("https://71q1jyiise.execute-api.us-west-1.amazonaws.com/dev/redis")
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
        promises.push(fetch("https://71q1jyiise.execute-api.us-west-1.amazonaws.com/dev/fauna")
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
        promises.push(fetch("https://71q1jyiise.execute-api.us-west-1.amazonaws.com/dev/dynamo")
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
        fetch("https://71q1jyiise.execute-api.us-west-1.amazonaws.com/dev/histogram")
            .then(res => res.json())
            .then(
                (result) => {
                    setLatency50({
                        redis: result.redis_histogram.p50,
                        dynamodb: result.dynamo_histogram.p50,
                        fauna: result.fauna_histogram.p50
                    })
                    setLatency99({
                        redis: result.redis_histogram.p99,
                        dynamodb: result.dynamo_histogram.p99,
                        fauna: result.fauna_histogram.p99
                    })
                    setLatency999({
                        redis: result.redis_histogram.p99_9,
                        dynamodb: result.dynamo_histogram.p99_9,
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
        console.log(items)
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
            This single page application compares the latencies of three serverless databases (
            <a rel="noreferrer" href="https://aws.amazon.com/dynamodb/" target="_blank">
                DynamoDB,
            </a>
            {" "}
            <a rel="noreferrer" href="https://fauna.com/" target="_blank">
                FaunaDB,
            </a>
            {" "}
            <a href="https://upstash.com/" target="_blank">
                Upstash (Redis)
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
            DynamoDB: {Math.round(dynamoLatency)} ms | FaunaDB: {Math.round(faunaLatency)} ms |
            Upstash: {Math.round(redisLatency)} ms
            <br/>
            <br/>
            See <a href="https://blog.upstash.com/latency-comparison" rel="noreferrer" target="_blank">the blog post
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
                                ['FaunaDB', latency50.fauna, "#39059E", latency50.fauna],
                                ['Upstash', latency50.redis, "#6BE5A8", latency50.redis],
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
                                ['FaunaDB', latency99.fauna, "#39059E", latency99.fauna],
                                ['Upstash', latency99.redis, "#6BE5A8", latency99.redis],
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
                                ['FaunaDB', latency999.fauna, "#39059E", latency999.fauna],
                                ['Upstash', latency999.redis, "#6BE5A8", latency999.redis],
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
            <a href="https://71q1jyiise.execute-api.us-west-1.amazonaws.com/dev/histogram" rel="noreferrer"
               className="seelink" target="_blank">
                the full histogram
            </a>
            |
            <a href="https://blog.upstash.com/latency-comparison" rel="noreferrer" className="seelink" target="_blank">
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
