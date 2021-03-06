//具体的调用数据库的方法
const {exec} = require('./index.js')
const jwt = require('jsonwebtoken')
const { secretOrPrivateKey, JWT_EXPIRED } = require('../config.js')

//登陆
function login(data) {
	const sql = `select * from users where account = '${data.account}' and password = '${data.password}';`
	
	return exec(sql)
}

//查询是否已存在用户
function selectUser(data) {
	const sql = `select * from users where account = '${data.account}';`
	
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

//删除
function delet(data) {
	const sql = `delete from memoitem where time='${data}';`
	
	return exec(sql)
}

//qq登陆
function qqLogin(data){
	
}

//查询task数据
function selectTaskData(userName) {
	const sql = `select * from taskdata where user = '${userName}';`
	return exec(sql)
}

//新增用户task数据
function addTaskData(userName,taskData) {
	const sql = `insert into taskdata(user,taskData) values('${userName}','${taskData}');`
	return exec(sql)
}

//覆盖用户task数据
function editTaskData(userName,taskData) {
	const sql = `update taskdata set taskData='${taskData}' where user = '${userName}';`
	return exec(sql)
}

//覆盖label数据
function editLabelData(userName,labelData) {
	const sql = `update users set labelData='${labelData}' where account = '${userName}';`
	return exec(sql)
}

//查询label数据
function selectLabelData(userName) {
	const sql = `select * from users where account = '${userName}';`
	return exec(sql)
}

module.exports = {
	login,
	init,
	add,
	edit,
	delet,
	registe,
	qqLogin,
	selectTaskData,
	addTaskData,
	editTaskData,
	selectUser,
	editLabelData,
	selectLabelData
}
