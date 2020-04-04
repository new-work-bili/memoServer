var express = require('express');
var router = express.Router();
const request = require("request");
const jwt = require('jsonwebtoken')
const {
	PRIVATE_KEY,
	tokenOutTime
} = require('../config.js')
const {
	login,
	init,
	add,
	edit,
	delet,
	qqLogin,
	registe
} = require('../db/sql.js')
const appId = '101851279'
const appKey = '0835ace1f5216c95aa1fb5930168f50a'
var redirect_uri = 'http://lppwork.cn/memo/qqlogin' //回调域
var userData = { //返回用户数据
	account: '',
	password: '',
}

router.get('/memo/qqlogin/', function(req, res, next) {
	console.log('req.query:', req.query)
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
				console.log('body:', body)
				userData.account = body.nickname
				userData.password = qqOpenid //把Openid这个唯一标识作为密码
				//把登陆信息放入数据库
				login(userData).then(Lbdres => {
					if (!Lbdres || Lbdres.length == 0) {
						//未注册，进行注册
						registe(userData).then((Rbdres) => {
							console.log('QQ注册成功!')
						}).catch((err) => {
							console.log('QQ注册失败!', err)
						})
					}
					var username = userData.account
					const token = jwt.sign( //生成token
						{
							username
						},
						PRIVATE_KEY, {
							expiresIn: tokenOutTime
						}
					)
					console.log('QQ生成token成功')
					res.json({
						userData: userData,
						token: token
					})

				}).catch((err) => {
					console.log('QQ登陆err:', err)
				})

			})
		})
	})

});

module.exports = router;
