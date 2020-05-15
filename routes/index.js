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
	addTaskData
} = require('../db/sql.js')
const querystring = require('querystring'); //用于序列化
const getUserName = require('../func/getUserName.js') //用jwt反向解析出token中的用户名


//初始化数据，如果有token验证成功，返回用户数据，没有跳过
router.post('/init/', function(req, res, next) {
	var userName = getUserName(req.headers.authorization)
	// var userName = req.body.userName
	if (userName) {
		init(userName).then((bdres) => {
			//查询task数据
			selectTaskData(userName).then((taskBdres) => {
				// console.log('init>selectTaskData:',querystring.parse(taskBdres[0].taskData))
				let objTaskData
				if (taskBdres.length == 0) {
					//如果该用户没有过task数据，标记一下
					objTaskData = {
						err: 'null'
					}
				} else {
					objTaskData = querystring.parse(taskBdres[0].taskData) //解析(反序列化)
				}
				res.json({
					code: 1,
					userName: userName,
					msg: '同步成功!',
					userData: bdres,
					taskData: objTaskData
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
			code: 0,
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
	// let userName = req.body.userName
	console.log(taskData, userName)
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





module.exports = router;
