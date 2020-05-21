var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const {
	PRIVATE_KEY,
	tokenOutTime
} = require('../config.js')
const {
	login,
	init,
	registe,
	selectUser
} = require('../db/sql.js')




router.post('/', function(req, res, next) {
	// //通过token解析信息,获取用户名(不能依靠客户端在localStorage中传来的用户名，不安全)
	// if(req.headers.authorization	){
	// 	var reqToken = req.headers.authorization
	// 	var str=reqToken.replace("Bearer ","");   //去掉 Bearer
	// 	console.log(str)
	// 	jwt.verify(str, PRIVATE_KEY, function(err, resUser) {
	// 		console.log('resUser', resUser); 
	// 	})
	// }


	//登陆操作
	return login(req.body).then(data => {
		if (!data || data.length == 0) {
			res.json({
				code: -1,
				msg: '登陆失败'
			})
		} else {
			var username = req.body.account
			const token = jwt.sign( //生成token
				{
					username
				},
				PRIVATE_KEY, {
					expiresIn: tokenOutTime
				}
			)
			res.json({
				code: 1,
				msg: '登陆成功',
				username: username,
				token: token
			})
		}

	}).catch((err) => {
		console.log('err:', err)
	})

});

router.post('/registe/', function(req, res, next) {
	//先查询有没有已存在的用户
	selectUser(req.body).then((selectRes) => {
		if (!selectRes || selectRes.length == 0) {
			//进行注册
			registe(req.body).then((bdres) => {
				res.json({
					code: 1,
					msg: '注册成功!'
				})
			}).catch((err) => {
				console.log('registe>err:', err)
				res.json({
					code: -1,
					msg: '注册失败!'
				})
			})
		} else {
			res.json({
				code: -1,
				msg: '用户已存在!'
			})
		}
	}).catch((err) => {
		console.log('selectUser>err:', err)
		res.json({
			code: -1,
			msg: '注册失败!'
		})
	})


});


module.exports = router;
