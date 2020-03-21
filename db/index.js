 //编写执行sql的函数，这样调用这个模块就可以直接写sql语句了
const mysql = require('mysql')
const { MYSQL_CONF } = require('./config.js')	//导入连接对象

// //创建连接
const con = mysql.createConnection(MYSQL_CONF)

//创建连接对象
// const con = mysql.createConnection({
// 	host:'localhost',
// 	user:'root',
// 	password:'3103456827eahs',
// 	port:'3306',
// 	database:'memo'	//要操作那个库
// })

//开始连接
con.connect()
//执行sql的函数
function exec (sql) {
	const promise = new Promise((resolve,reject) => {	//第二种形式是直接return new Promise(( , ) =>{});这样就不用再在最后写
		con.query(sql,(err,result) => { 		//执行；err返回错误，result是把sql语句执行的结果返回
			if(err){
				reject(err)	//返回错误
				return
			}
			resolve(result)	//返回结果,resolve是then()下一步，并把sql语句的执行结果作为参数传进去
		})
	})
	return promise
}

module.exports = {
	exec
} 