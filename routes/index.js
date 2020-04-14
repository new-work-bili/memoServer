var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const {login,init,add,edit,delet} = require('../db/sql.js')

//初始化数据，如果有token验证成功，返回用户数据，没有跳过
router.post('/init/', function(req, res, next) {
	var userName = req.body.userName
	if(userName){
		return init(userName).then((bdres)=>{
			res.json({
				code: 3,
				userName:userName,
				msg:'获取数据成功',
				userData:bdres
			})
		}).catch((err)=>{
			console.log('init>err:',err)
			res.json({
				code: -3,
				userName:userName,
				msg:'获取数据失败!'
			})
		})
		
	}else{
		res.json({
			code: -3,
			msg:'没有用户名'
		})
	}
	
});

//增加 or 编辑
router.post('/add/', function(req, res, next) {
	var itemData = req.body.itemData
	if(itemData){
		//增加
		if(itemData.isNew){
			return add(itemData).then((bdres)=>{
				console.log(bdres)
				res.json({
					code: 3,
					msg:'保存成功',
				})
			}).catch((err)=>{
				console.log('add>err:',err)
			})
		}else{	//编辑
			return edit(itemData).then((bdres)=>{
				console.log(bdres)
				res.json({
					code: 3,
					msg:'更新成功',
				})
			}).catch((err)=>{
				console.log('edit>err:',err)
			})
		}
	}else{
		res.json({
			code: -3,
			msg:'没有数据'
		})
	}
	
});

//删除item
router.post('/delete/', function(req, res, next) {
	var time = req.body.time
	if(time){
		return delet(time).then((bdres)=>{
			// console.log(bdres)
			res.json({
				code: 3,
			})
		}).catch((err)=>{
			console.log('delet>err:',err)
		})
		
	}else{
		res.json({
			code: 0,
			msg:'没有time'
		})
	}
	
});






module.exports = router;
