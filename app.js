const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
// const logger = require('morgan');
const cors = require('cors')
const jwtAuth = require('./routes/jwt.js') //token验证
const {
	token_ERR
} = require('./config.js');
const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const QQ = require('./routes/QQ');
const history = require('connect-history-api-fallback') //应对vue的history
const compression = require('compression') //Gzipped压缩
const morgan = require('morgan'); //日志
const app = express();
const getUserName = require('./func/getUserName.js') //用jwt反向解析出token中的用户名
const _log = require('./func/log.js')



//设置跨域访问
app.use(cors());



// 启用gzip
app.use(compression());




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
//输出日志
app.use(morgan('joke', {
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
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.use(morgan('dev')); //
app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/dist')));

//应对vue的history，::放在处理路由之前，并且在引入静态文件之后
app.use(history())
//验证token
app.use(jwtAuth)
app.use('/login/', loginRouter);
app.use('/', QQ)
//判断在线、离线操作；在这之前写登陆，注销，之后写在线操作的增删改查
app.use(function(req, res, next) {
	//如果请求头有token，那么往下走，用户在做在线操作，需要进行实时保存；当QQ登陆时也是线上操作
	if (req.headers.authorization || req.originalUrl == '/memo/qqlogin/') {
		console.log('next')
		next()
	} else { 
		//如果没有token，直接返回不往下走，这是用户在做离线操作
		//并且做离线操作走到这一步肯定是做了不正当的操作(比如手动在localStorage里输入用户名)或者是访问不匹配的路由
		//这是应该返回的是403
		console.log('离线操作')
		next(createError(403));
	}

});

//增删改查
app.use('/', indexRouter);


//处理404
app.use(function(req, res, next) {
	console.log('404')
	next(createError(404));
});


//统一对错误进行处理
app.use(function(err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	console.log('app.js>err:', err)
	//token错误时，err中的name的值，具体token报错信息见https://www.jianshu.com/p/9b71a1582c40
	if (err.name == 'UnauthorizedError') {
		console.log(err)
		res.json({
			code: token_ERR,
			error: err.status,
			errorMsg: err.message
		})
		return
	}
	res.status(err.status || 500);
	res.render('error');
});
module.exports = app;
