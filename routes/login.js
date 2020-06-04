var express = require('express');
var router = express.Router();
const {
	login,
	init,
	registe,
	selectUser
} = require('../db/sql.js')
const createToken = require('../func/createToken.js')
//链接redis
const redis = require('../func/redis.js')
const redisClient = redis.redisClient


router.post('/', function(req, res, next) {

	//登陆操作
	return login(req.body).then(data => {
		if (!data || data.length == 0) {
			res.json({
				code: -1,
				msg: '登陆失败'
			})
		} else {
			var username = req.body.account
			// const token = jwt.sign( //生成token
			// 	{
			// 		username
			// 	},
			// 	PRIVATE_KEY, {
			// 		expiresIn: tokenOutTime
			// 	}
			// )
			const token = createToken(username)
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
router.post('/logout/',function(req,res,next){
	console.log('logout:',req.user)
	redisClient.hdel('token',req.user.time,(err,resdata)=>{
		if(err){
			console.log('logout delErr:',err)
		}
		console.log('删除ok')
		res.json({
			code: 1,
			msg: '注销成功!'
		})
	})
})


module.exports = router;
