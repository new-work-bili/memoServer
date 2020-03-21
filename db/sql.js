//具体的调用数据库的方法
const {exec} = require('./index.js')
const jwt = require('jsonwebtoken')
const { secretOrPrivateKey, JWT_EXPIRED } = require('../config.js')

//登陆
function login(data) {
	const sql = `select * from users where account = '${data.account}' and password = '${data.password}';`
	
	return exec(sql)
}

//注册
function registe(data) {
	const sql = `insert into users(account,password) values('${data.account}','${data.password}');`
	
	return exec(sql)
}

//过去用户item数据
function init(data) {
	const sql = `select type,title,label,time,content from memoitem where user = '${data}';`
	
	return exec(sql)
}

//增加item
function add(data) {
	const sql = `insert into memoitem(user,type,title,label,time,content) values('${data.userName}','${data.type}','${data.title}','${data.label}','${data.time}','${data.content}');`
	
	return exec(sql)
}

//编辑
function edit(data) {
	const sql = `update memoitem set type='${data.type}',title='${data.title}',label='${data.label}',content='${data.content}' where time = '${data.time}';`
	
	return exec(sql)
}

//编辑
function delet(data) {
	const sql = `delete from memoitem where time='${data}';`
	
	return exec(sql)
}

module.exports = {
	login,
	init,
	add,
	edit,
	delet,
	registe
}
