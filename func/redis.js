var redis = require('redis');
const {
	REDIS_CONF
} = require('../db/config.js') //导入连接对象
const redisClient = redis.createClient(REDIS_CONF);


redisClient.on('error', function(err) {
	console.log('Error ' + err);
});
redisClient.on('connect', function() {
	console.log('Redis is ready');
});

//操作，判断是否在黑名单中

exports.redis = redis;
exports.redisClient = redisClient;