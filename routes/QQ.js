var express = require('express');
var router = express.Router();
const request = require("request");
const {
	login,
	init,
	add,
	edit,
	delet,
	qqLogin
} = require('../db/sql.js')
const appId = '101851279'
const appKey = '0835ace1f5216c95aa1fb5930168f50a'
var redirect_uri = 'http://lppwork.cn/#/memo/qqlogin' //回调域
var userData = {	//返回用户数据
	get:false,
	name:'',
	qqOpenid:'',
}

router.get('/memo/qqlogin/', function(req, res, next) {
	console.log('req.query:', req.query)
	console.log('QQreq.url', req.url)
	var code = req.query.code //获取code
	//通过code获取token
	var getTokenUrl =
		`https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${appId}&client_secret=${appKey}&code=${code}&redirect_uri=${redirect_uri}`

	request.get({
		url: getTokenUrl
	}, (err, httpResponse, body) => {
		console.log('通过code获取token:', body)
		var access_token = body.split('=')[1].split('&')[0]; //获取返回的token

		//使用Access Token 获取用户openid/unionid
		var getMeUrl = 'https://graph.qq.com/oauth2.0/me?access_token=' + access_token;
		request.get({
			url: getMeUrl
		}, (err, httpResponse, body) => {
			console.log('使用Access Token 获取用户openid/unionid:', body)
			var str = body;
			var jsonStr = str.replace('callback( ', '');
			jsonStr = jsonStr.replace(' );', '');
			jsonStr = JSON.parse(jsonStr);
			var qqOpenid = jsonStr['openid'];
			var qqClient_id = jsonStr['client_id'];
			var getUserData =
				`https://graph.qq.com/user/get_user_info?access_token=${access_token}&oauth_consumer_key=${appId}&openid=${qqOpenid}`
			request.get({
				url: getUserData
			}, (err, httpResponse, body) => {
				console.log('get用户数据')
				body = JSON.parse(body);
				console.log('body:',body)
				var user = {
					account: body.nickname, //昵称，中文？
					password: qqOpenid //Openid唯一标识
				}
				userData.get = true
				userData.name = body.nickname 
				userData.qqOpenid = qqOpenid
				next()
			})
		})
	})
	
	//正常请求
	//注意QQ登陆的时候应该只查qqOpendid
	// console.log('监听到/QQ/')
	// res.json("\
	// 					    <h1>QQ昵称：" + body.nickname + "openid:" + qqOpenid +
	// 	"</h1>\
	// 					    <p>![QQ头像](" + body.figureurl_qq_1 + ")</p>\
	// 					    <p>性别：" + body.gender +
	// 	"</p>\
	// 					    <p>地区：" + body.province + "," + body.city + "</p>\
	// 					")
		

});

// router.get('/qqData/',function(req,res,next){
// 	console.log('处理qqData接口')
// 	if(userData.get = true){
// 		res.json({
// 			userData:userData
// 		})
// 	}
// })
module.exports = router;
