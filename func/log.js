const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const getUserName = require('./getUserName.js') //用jwt反向解析出token中的用户名
const morgan = require('morgan'); //日志

function _log(req, res, next) {
	var username
	// 覆盖morgan源代码中的write方法的对象
	var dbStream = {
		//会调用这个方法，并且传入本次的处理后的日志内容line
		write: function(line) {
			//保存当前日志文件的所有内容
			var accessData = fs.readFileSync(path.join(__dirname, 'access.log'))
			//把本次的日志内容 覆盖 进日志文件
			fs.writeFile('./access.log', line, function(err) {
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
	// 自定义format，其中包含自定义的token
	morgan.format('joke', '[:date[iso]] :url :status :msg \r\n ');
	next();
}

module.exports = _log;
