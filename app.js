const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
// const logger = require('morgan');
const cors = require('cors')
const jwtAuth = require('./func/jwt.js') //token验证
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
const logFunc = require('./func/log.js') //morgan配置中间件
const timing = require('./func/timing.js')
var minimist = require('minimist');

//获取packge.json下scripts的命令参数
var args = minimist(process.argv.slice(2));



//定时
timing()


//设置跨域访问
app.use(cors());



// 启用gzip
app.use(compression());

//morgan日志
// app.use(logFunc)
//测试:自带的
app.use(morgan('dev'));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));
app.use(cookieParser());
//应对vue的history，要使其生效，需要放在express.static之前，但这样就不会触发后面的404...
app.use(history())

if(args.name && args.name == 'weihu'){
	//调维护页面
	console.log('weihu')
	app.use(express.static(path.join(__dirname, 'public/weihu')));
}else{
	//正常页面
	app.use(express.static(path.join(__dirname, 'public/dist')));
	
}




//验证token
app.use(jwtAuth)
app.use('/login/', loginRouter);
app.use('/', QQ)
//判断在线、离线操作；在这之前写登陆，注销，之后写在线操作的增删改查
app.use(function(req, res, next) {
	var routerUrl = req.originalUrl.split('?')[0]
	//如果请求头有token，那么往下走，用户在做在线操作，需要进行实时保存；当QQ登陆时也是线上操作
	if (req.headers.authorization || routerUrl == '/memo/qqlogin') {
		console.log('next')
		next()
	} else {
		//如果没有token，直接返回不往下走，这是用户在做离线操作
		//并且做离线操作走到这一步肯定是做了不正当的操作(比如手动在localStorage里输入用户名)或者是访问不匹配的路由
		//两种情况：1.在线、离线操作输入不匹配的url，在线就算有token但他不会发过来，所以会走到这里--->需要404：这些都是get
		//2.离线操作如果要是手动在localStorage里输入用户名，这是会发送请求但也没有token，会走到这里--->需要403:post
		console.log('离线操作:mouth:', req.method)
		if (req.method == 'POST') {
			next(createError(403));
		}
		if (req.method == 'GET') {
			next(createError(404));
		}

	}

});

//增删改查
app.use('/', indexRouter);


//处理404
app.use(function(req, res, next) {
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
