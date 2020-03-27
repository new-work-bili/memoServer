var express = require('express');
var router = express.Router();
const request = require("request");
const {
	login,
	init,
	add,
	edit,
	delet
} = require('../db/sql.js')
const appId = '101851279'						
const appKey = '0835ace1f5216c95aa1fb5930168f50a'
const redirect_uri = 'http://lppwork.cn/memo/qqlogin'	//回调域

router.get('/memo/qqlogin/', function(req, res, next) {
	console.log('req.query:', req.query)
	console.log('QQreq.url', req.url)
	const code = req.query.code

	const getTokenUrl =
		`https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${appId}&client_secret=${appKey}&code=${code}&redirect_uri=${redirect_uri}`
	//通过code获取token
	// res.redirect(`https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${appId}&client_secret=${appKey}&code=${code}&redirect_uri=${redirect_uri}`);
	request.get({url:getTokenUrl},(err, httpResponse, body)=>{
		console.log('request库body:',body)
	})
	// res.json({
	// 	code: 1,
	// 	code:'code'
	// })
});

module.exports = router;
