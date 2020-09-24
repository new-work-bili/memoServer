const express = require('express');
const router = express.Router();
const qs = require('qs')
const createError = require('http-errors');
const morgan = require('morgan'); //日志
const app = express();
const path = require('path');
const fs = require('fs');
// const logFunc = require('../func/log.js') //morgan自定义配置的日志中间件



router.get('/ListenLog/', function(req, res, next) {
	var pares = req.url.split('?')[1]
	var data = qs.parse(pares)
	
	// //文件路径
	// var accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/webTime.log'), {flags: 'a'})
	// //日志
	// morgan.token('webTime_usePC_token', function(req, res) {
	// 	return `"${data}"`;
	// });
	// morgan.format('webTime_usePC_format', ':webTime_usePC \r\n ');
	// app.use(morgan('webTime_usePC_format',{stream: accessLogStream}));
	
	
	
	
	// app.use(logFunc)
	res.status(204); //无需返回,204
	
	res.end()
});

module.exports = router;
