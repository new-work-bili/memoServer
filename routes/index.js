var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const {
	login,
	init,
	add,
	edit,
	delet,
	selectTaskData,
	editTaskData,
	addTaskData,
	editLabelData,
	selectLabelData
} = require('../db/sql.js')
const querystring = require('querystring'); //用于序列化
const getUserName = require('../func/getUserName.js') //用jwt反向解析出token中的用户名
const createToken = require('../func/createToken.js')
//链接redis
const redis = require('../func/redis.js')
const redisClient = redis.redisClient

//初始化数据，如果有token验证成功，返回用户数据，没有跳过
router.post('/init/', function(req, res, next) {
	console.log('init放入黑名单')
	var userName = getUserName(req.headers.authorization)
	if (userName) {
		//token的信息会存储在req.user中: iat 是token开始时间、exp截止时间
		console.log('init放入黑名单的token信息:',req.user)
		//把本次token放入黑名单
		//使用hset写入(hash名,key,value),key是开始时间,value是截止时间
		redisClient.hset('token', req.user.time, req.user.exp)
		//生成新token传给前端
		const token = createToken(userName)
		
		
		
		
		//处理路由;查询
		init(userName).then((bdres) => {
			//查询task数据
			selectTaskData(userName).then((taskBdres) => {
				let objTaskData
				if (taskBdres.length == 0) {
					//如果该用户没有过task数据，标记一下
					objTaskData = {
						err: 'null'
					}
				} else {
					objTaskData = querystring.parse(taskBdres[0].taskData) //解析(反序列化)
				}
				//查询label类别信息
				selectLabelData(userName).then((dbres)=>{
					var labelData = {}
					console.log('dbres[0].labelData:',dbres[0].labelData,'length:')
					if(dbres.length !=0 && dbres[0].labelData){
						labelData = JSON.parse(dbres[0].labelData)
					}else{
						labelData = ['生活','学习','工作']
					}
					res.json({
						code: 1,
						userName: userName,
						msg: '同步成功!',
						userData: bdres,
						taskData: objTaskData,
						token:token,
						labelData:labelData
					})
				}).catch((err)=>{
					console.log('labelErr:',err)
					res.json({
						code: -1,
						msg: '获取数据失败!',
					})
				})
				
				
			}).catch((err) => {
				console.log('init>selectTaskData:>err', err)
				res.json({
					code: -1,
					msg: '获取数据失败!',
					err: err
				})
			})
		}).catch((err) => {
			console.log('init>err:', err)
			res.json({
				code: -1,
				msg: '获取数据失败!',
				err: err
			})
		})

	} else {
		res.json({
			code: -1,
			msg: '没有用户名'
		})
	}

});

//增加 or 编辑
router.post('/add/', function(req, res, next) {
	var itemData = req.body.itemData
	if (itemData) {
		//增加
		if (itemData.isNew) {
			return add(itemData).then((bdres) => {
				console.log(bdres)
				res.json({
					code: 1,
					msg: '保存成功',
				})
			}).catch((err) => {
				console.log('add>err:', err)
				if (err.errno == 1406) {
					res.json({
						code: -1,
						msg: '超出长度!',
					})
				}
			})
		} else { //编辑
			return edit(itemData).then((bdres) => {
				console.log(bdres)
				res.json({
					code: 1,
					msg: '同步成功',
				})
			}).catch((err) => {
				console.log('edit>err:', err)
				res.json({
					code: -1,
					msg: '超出长度!',
				})
			})
		}
	} else {
		res.json({
			code: -1,
			msg: '没有数据'
		})
	}

});

//删除item
router.post('/delete/', function(req, res, next) {
	var time = req.body.time
	if (time) {
		return delet(time).then((bdres) => {
			// console.log(bdres)
			res.json({
				code: 1,
			})
		}).catch((err) => {
			console.log('delet>err:', err)
		})

	} else {
		res.json({
			code: -1,
			msg: '没有time'
		})
	}

});

//设置置顶
router.post('/setTop/', function(req, res, next) {
	let itemData = req.body.item
	return edit(itemData).then((bdres) => {
		console.log(bdres)
		res.json({
			code: 1,
			msg: '同步成功',
		})
	}).catch((err) => {
		console.log('edit>err:', err)
		res.json({
			code: -1,
			msg: '同步失败!',
		})
	})

});

//增肌/编辑/删除 task数据
router.post('/taskData/', function(req, res, next) {
	let taskData = querystring.stringify(req.body.taskData) //序列化，以便存入数据库
	var userName = getUserName(req.headers.authorization)
	selectTaskData(userName).then((bdres) => {
		if (bdres.length == 0) {
			console.log('该用户无task数据,新增')
			return addTaskData(userName, taskData).then((addBdres) => {
				console.log('新增task成功', addBdres)
				res.json({
					code: 1,
					msg: '同步成功',
				})
			}).catch((err) => {
				console.log('addTaskData>err', err)
				res.json({
					code: -1,
					msg: '同步失败，请重试!',
				})
			})
		} else {
			console.log('该用户有task数据,覆盖')
			return editTaskData(userName, taskData).then((editBdres) => {
				console.log('覆盖task成功', editBdres)
				res.json({
					code: 1,
					msg: '同步成功',
				})
			}).catch((err) => {
				console.log('editTaskData>err', err)
				res.json({
					code: -1,
					msg: '同步失败，请重试!',
				})
			})
		}
		console.log('selectTaskData>bdres', bdres)
	}).catch((err) => {
		console.log('selectTaskData>err', err)
		res.json({
			code: -1,
			msg: '同步失败，请重试!',
		})
	})

});

//增肌/编辑/删除 类别---就是覆盖
router.post('/changeLabel/', function(req, res, next) {
	let lebelData = JSON.stringify(req.body.labelArr) //序列化，以便存入数据库
	let userName = getUserName(req.headers.authorization)
	console.log(JSON.stringify(req.body.labelArr))
	editLabelData(userName,lebelData).then(()=>{
		console.log('成功')
		res.json({
			code: 1,
		})
	}).catch(()=>{
		res.json({
			code: -1,
		})
	})

	
});





module.exports = router;
