const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const getUserName = require('./getUserName.js') //用jwt反向解析出token中的用户名
const morgan = require('morgan'); //日志

var username
// 覆盖morgan源代码中的write方法的对象
var dbStream = {
	//会调用这个方法，并且传入本次的处理后的日志内容line
	write: function(line) {
		//保存当前日志文件的所有内容
		var accessData = fs.readFileSync(path.join(__dirname, '../access.log'))	//这个是绝对地址
		//把本次的日志内容 覆盖 进日志文件
		fs.writeFile('./access.log', line, function(err) {		//相对地址，再执行的时候(app.js)的相对位置，所以是./而不是../
			if (err) {
				throw err;
			}
			//然后在把之前日志文件的内容加在后面
			fs.writeFile('./access.log', accessData, {
				'flag': 'a'
			}, function(err) { // 传递了追加参数 { 'flag': 'a' }
				if (err) {
					throw err;
				}
			});
		});
	}
};
// 自定义token
morgan.token('msg', function(req, res) {
	console.log('username:', username)
	if (req.originalUrl == '/login/') {
		return `"${username}"进行了登陆`
	} else if (req.originalUrl == '/login/registe/') {
		return `"${username}"进行了注册`
	} else if (req.originalUrl == '/memo/qqlogin/') {
		return `"${username}"使用了QQ登陆`
	} else {
		return 'WDNM'
	}
});
morgan.token('time', function(req, res) {
	function add0(m) {
		return m < 10 ? '0' + m : m
	}

	var time = new Date();
	var y = time.getFullYear();
	var m = time.getMonth() + 1;
	var d = time.getDate();
	var h = time.getHours();
	var mm = time.getMinutes();
	var s = time.getSeconds();
	return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
});

// 自定义format，其中包含自定义的token
morgan.format('joke', ':time :url :status :msg \r\n ');

var logFunc = morgan('joke', {
	skip: function(req, res) { //忽略日志,只输出用户登录、QQ登陆、注册等操作的日志
		if (req.body.account || req.body.userName) {
			username = req.body.account || req.body.userName
		} else if (req.headers.authorization) {
			username = getUserName(req.headers.authorization)
		} else {
			username = ''
		}
		var logPort = ['/login/', '/login/registe/', '/memo/qqlogin/']
		var is = logPort.filter(item => item == req.originalUrl) //req.originalUrl---完整url路径

		return !is.length
	},
	//把日志写入日志文件,如果删掉此行，那么日志会打印到控制台；
	//这里本来时传入的是fs.createWriteStream处理的日志文件流，但此处传入自己配置的含有write对象，用来实现倒写日志
	stream: dbStream
})

module.exports = logFunc;

