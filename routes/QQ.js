var express = require('express');
var router = express.Router();
const request = require("request");		
// const urlencode = require('urlencode');
const {
	login,
	init,
	add,
	edit,
	delet
} = require('../db/sql.js')
const appId = '101851279'
const appKey = '0835ace1f5216c95aa1fb5930168f50a'
const redirect_uri = 'http://lppwork.cn/memo/qqlogin' //回调域

router.get('/memo/qqlogin/', function(req, res, next) {
	console.log('req.query:', req.query)
	console.log('QQreq.url', req.url)
	var code = req.query.code	//获取code

	//通过code获取token
	var getTokenUrl =`https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${appId}&client_secret=${appKey}&code=${code}&redirect_uri=${redirect_uri}`
	request.get({url: getTokenUrl}, (err, httpResponse, body) => {
		console.log('通过code获取token:', body)
		var access_token = body.split('=')[1].split('&')[0];	//获取返回的token
		//使用Access Token 获取用户openid/unionid
		var getMeUrl = 'https://graph.qq.com/oauth2.0/me?access_token=' + access_token;
		request.get({url:getMeUrl},(err, httpResponse, body)=>{
			console.log('使用Access Token 获取用户openid/unionid:', body)
			var str = body;
			var jsonStr = str.replace('callback( ','');
			jsonStr = jsonStr.replace(' );','');
			jsonStr = JSON.parse(jsonStr);
			var qqOpenid = jsonStr['openid'];
			var qqClient_id = jsonStr['client_id'];
			var getUserData = `https://graph.qq.com/user/get_user_info?access_token=${access_token}&oauth_consumer_key=${appId}&openid=${qqOpenid}`
			 request.get({url:getUserData},  (err, httpResponse, body) =>{
			                body = JSON.parse(body);
			                console.log("\
			                    <h1>QQ昵称："+ body.nickname +"openid:"+ qqOpenid +"</h1>\
			                    <p>![]("+body.figureurl_qq_1+")</p>\
			                    <p>性别："+ body.gender+"</p>\
			                    <p>地区："+body.province +","+ body.city+"</p>\
			                ");
			            })
		})
	})
});

module.exports = router;
