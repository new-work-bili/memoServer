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
	res.status(204); //无需返回,204
	res.end()
});

module.exports = router;
