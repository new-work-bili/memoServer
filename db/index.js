//编写执行sql的函数，这样调用这个模块就可以直接写sql语句了
const mysql = require('mysql')
const {
	MYSQL_CONF
} = require('./config.js') //导入连接对象

//创建连接：
//用 createConnection 创建 Mysql 连接，每执行一次 connection.query 都是一个全新的连接，会造成一个资源的极大浪费，降低性能
// let con = mysql.createConnection(MYSQL_CONF)


// //开始连接
// con.connect()
// //执行sql的函数
// function exec(sql) {
// 	const promise = new Promise((resolve, reject) => { //第二种形式是直接return new Promise(( , ) =>{});这样就不用再在最后写
// 		con.query(sql, (err, result) => { //执行；err返回错误，result是把sql语句执行的结果返回
// 			if (err) {
// 				reject(err) //返回错误
// 				return
// 			}
// 			resolve(result) //返回结果,resolve是then()下一步，并把sql语句的执行结果作为参数传进去
// 		})
// 		con.release(); //释放查询，不然查询过多的话会报错
// 	})

// 	return promise
// }


//连接池是另外的一种执行方法，它一次性的创建了多个连接，然后根据客户端的查询，自动的 分发、复用、管理 这些连接。
let pool = mysql.createPool(MYSQL_CONF)

function exec(sql) {
	return new Promise((resolve, reject) => {
		//getConnection：从连接池中取出连接，如无连接可用则隐式的建立一个数据库连接。
		pool.getConnection((err, connection) => {
			if (err) {
				console.log('连接错误')
				return reject(err)
			} else {
				//查询数据，这个一样
				connection.query(sql, (err, result) => {
					if (err) {
						console.log('查询错误')
						return reject(err)
					} else {
						return resolve(result)
					}
					//释放连接:当连接不再使用时，用connection对象的release方法将其归还到连接池中
					resolve(result);
				})
			}

		})
	})
}
module.exports = {
	exec
}
