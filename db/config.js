//区分不同环境下所调用的数据库;容易报错先不用

 //调用环境变量
 const env = process.env.NODE_ENV
 //配置

 let MYSQL_CONF
 let REDIS_CONF

 if (env === 'dev') { //如果是开发(线下)环境
 	MYSQL_CONF = {
 		host: 'localhost', //复制demo里的
 		user: 'root',
 		password: '3103456827eahs',
 		port: '3306',
 		database: 'memo',
		connectionLimit:100	,//最大连接数
		useConnectionPooling: true
 	}

 	// redis
 	REDIS_CONF = {
 		port: 6379,
 		host: '127.0.0.1'
 	}
 }

 if (env === 'production') { //如果是线上环境
 	MYSQL_CONF = {
 		host: '123.57.209.85', //应该是要调用线上数据库的，但现在还没有，所以先用demo的
 		user: 'root',
 		password: '1655170926',
 		port: '3306',
 		database: 'memo',
		connectionLimit:100	,//最大连接数
		useConnectionPooling: true
 	}

 	// redis
 	REDIS_CONF = {
 		port: 6379,
 		// host: '123.57.209.85'
		host: '127.0.0.1'
 	}
 }

 module.exports = {
 	MYSQL_CONF,
 	REDIS_CONF
 }
