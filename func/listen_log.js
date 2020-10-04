const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const morgan = require('morgan'); //日志
const qs = require('qs')
//链接redis
const redis = require('../func/redis.js')
const redisClient = redis.redisClient




var accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/webTime.log'), {
	flags: 'a'
})
//日志
morgan.token('webTime_usePC_token', function(req, res) {
	//封装之后的req和app下直接使用的app不一样，这里要用req.originalUrl来获取；app下可以直接用req.route
	var rout = req.originalUrl.split('?')[0]
	var pares = req.originalUrl.split('?')[1]
	if (rout == '/ListenLog') {
		//PV++
		var Pv_num;
		redisClient.get('PV', (item, data) => {
			Pv_num = data;
			Pv_num++;
			redisClient.set('PV',Pv_num)
		})
		
		
		
		//前端性能log
		var data = qs.parse(pares)
		return `${JSON.stringify(data)}`;
	}
});
morgan.format('webTime_usePC_format', ':time :webTime_usePC_token');


//封装中间件
var linten_log = morgan('webTime_usePC_format', {
	stream: accessLogStream
})

module.exports = linten_log;
