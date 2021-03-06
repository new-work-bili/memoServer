var express = require('express');
var router = express.Router();
const request = require("request");
const jwt = require('jsonwebtoken')
const {
	PRIVATE_KEY,
	tokenOutTime,
	appId,
	appKey
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
const createToken = require('../func/createToken.js')
var redirect_uri = 'http://lppwork.cn/memo/qqlogin' //回调域
var userData = { //返回用户数据
	account: '',
	password: '',
}

router.get('/memo/qqlogin/', function(req, res, next) {
	console.log('之前中')
	var code = req.query.code //获取code
	if (!code) {
		next()
	} else {
		//通过code获取token
		var getTokenUrl =
			`https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${appId}&client_secret=${appKey}&code=${code}&redirect_uri=${redirect_uri}`
		request.get({
			url: getTokenUrl
		}, (err, httpResponse, body) => {
			if(err){
				console.log('获取token错误',err)
				res.status(500).end('获取token错误')
			}
			var access_token = body.split('=')[1].split('&')[0]; //获取返回的token
			//使用Access Token 获取用户openid/unionid
			var getMeUrl = 'https://graph.qq.com/oauth2.0/me?access_token=' + access_token;
			request.get({
				url: getMeUrl
			}, (err, httpResponse, body) => {
				if(err){
					console.log('获取用户openid/unionid错误',err)
					res.status(500).end('获取用户openid/unionid错误')
				}

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
					if(err){
						console.log('获取用户最终信息错误',err)
						res.status(500).end('获取用户最终信息错误')
					}

					body = JSON.parse(body);
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
						//生成新token传给前端
						var token = createToken(username)
						console.log('QQ生成token成功')
						res.json({
							code: 1,
							userData: userData,
							token: token
						})

					}).catch((err) => {
						console.log('QQ登陆err:', err)
					})

				})
			})
		})
	}
});


module.exports = router;
