// const assetsAddress = "../../assets/assets"
// const assetsAddress = "../web/assets"
// const assetsAddress = "./assets"
const assetsAddress = "../../html/yadin"

const redis = require("redis");
// const cassandra = require('cassandra-driver');
// var neo4j = require('neo4j-driver')
// const io = require('socket.io')();



// const PORT = 8101;
// const USOCKETPORT = 8110;
// const TSOCKETPORT = 8111;

const PORT = 5070;
const USOCKETPORT = 5071;
const TSOCKETPORT = 5072;



const DATABSENAME = "yadin";
const HOSTNAME = '127.0.0.1';
const MONGOADDRESS = 'mongodb://127.0.0.1:27017/'
const REDISADDRESS = { port: 6379, host: '127.0.0.1' };
const REDISTOPICSADDRESS = { port: 6379, host: '127.0.0.1' };
const REDISRIGRAMADDRESS = { port: 6379, host: '127.0.0.1' };
const REDISBSSADDRESS = { port: 6379, host: '127.0.0.1' };

const KAFKABROKERS = ['127.0.0.1:9092']
const ELASTICADDRESS = 'http://localhost:9200'
const NEO4JADDRESS = 'neo4j://localhost'

// const HOSTNAME = 'nodejs';
// const MONGOADDRESS = 'mongodb://mongodb:27017/'
// const REDISADDRESS = { port: 6379, host: 'redis' };
// const KAFKABROKERS = ['kafka1:9093'] //, 'kafka2:9094']
// const ELASTICADDRESS = 'elastic1:9200'
// const NEO4JADDRESS = 'neo4j://localhost'


const redisDB = redis.createClient(REDISADDRESS);
const redisUsers = redis.createClient(REDISADDRESS);
const redisMessenger = redis.createClient(REDISADDRESS);
const redisSequence = redis.createClient(REDISADDRESS);

const redisAdmins = redis.createClient(REDISADDRESS);

const redisThings = redis.createClient(REDISADDRESS);

const redisTopic = redis.createClient(REDISTOPICSADDRESS);

// const elasticDB = new elasticsearch.Client({
//     host: ELASTICADDRESS,
//     log: 'trace',
//     apiVersion: '7.2', // use the same version of your Elasticsearch instance
// });

// const cassandraDB = new cassandra.Client({
//     contactPoints: ['127.0.0.1:9042'],
//     localDataCenter: 'datacenter1',
//     keyspace: 'test_keyspace'
// });
// var neo4jDriver = neo4j.driver(
//     NEO4JADDRESS,
//     neo4j.auth.basic('neo4j', 'neo4j')
// )
// var neo4jSession = neo4jDriver.session()




const subscriber = redis.createClient(REDISADDRESS);
const publisher = redis.createClient(REDISADDRESS);

const topicsSubscriber = redis.createClient(REDISTOPICSADDRESS);
const topicsPublisher = redis.createClient(REDISTOPICSADDRESS);

const rigramSubscriber = redis.createClient(REDISRIGRAMADDRESS);
const rigramPublisher = redis.createClient(REDISRIGRAMADDRESS);

const bssSubscriber = redis.createClient(REDISBSSADDRESS);
const bssPublisher = redis.createClient(REDISBSSADDRESS);
// const kafkaService = new Kafka({
//     clientId: 'my-app',
//     brokers: KAFKABROKERS
//         // brokers: ['localhost:9092']
// })


module.exports = {
    assetsAddress,
    PORT,
    DATABSENAME,
    HOSTNAME,
    MONGOADDRESS,
    redisDB,
    redisUsers,
    redisThings,
    redisAdmins,
    redisMessenger,
    publisher,
    subscriber,
    topicsSubscriber,
    topicsPublisher,
    rigramSubscriber,
    rigramPublisher,
    bssSubscriber,
    bssPublisher,
    USOCKETPORT,
    TSOCKETPORT,
    REDISADDRESS,
    redisSequence,
    // elasticDB,
    // cassandraDB,
    // neo4jDriver,
    // neo4jSession,
    // kafkaService
}

// exports.DATABSENAME
// exports.HOSTNAME
// exports.MONGOADDRESS
// exports.REDISADDRESS
// exports.redisDB