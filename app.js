const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
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



//设置跨域访问
app.use(cors());
//应对vue的history
app.use(history())
// 启用gzip
app.use(compression());


//设置日志文件路径
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
	flags: 'a'
});
var username
// 自定义token
morgan.token('msg', function(req, res) {
	if(req.originalUrl == '/login/'){
		return `"${username}"进行了登陆`
	}else if(req.originalUrl == '/login/registe/'){
		return `"${username}"进行了注册`
	}else if(req.originalUrl == '/memo/qqlogin/'){
		return `"${username}"使用了QQ登陆`
	}else{
		return 'WDNM'
	}
});
morgan.token('test', function(req, res) {
	return '日志:';
});
// 自定义format，其中包含自定义的token
morgan.format('joke', ':url :status :msg [:date[iso]] \r\n ');
app.use(morgan('joke', {
	skip: function(req, res) {						//忽略日志,只输出用户登录、QQ登陆、注册等操作的日志
		if(req.body.account || req.body.userName){
			username = req.body.account || req.body.userName
		}else if(req.headers.authorization){
			username = getUserName(req.headers.authorization)
		}else{
			username = ''
		}
		var logPort = ['/login/','/login/registe/','/memo/qqlogin/']
		var is = logPort.filter(item => item == req.originalUrl)//req.originalUrl---完整url路径
		return !is.length
	},
	stream: accessLogStream		//把日志写入日志文件,如果删掉此行，那么日志会打印到控制台
}));




app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/dist')));


//验证token
app.use(jwtAuth)
app.use('/login/', loginRouter);
app.use('/', QQ)
//在这个前面写登陆，注销，注册
app.use(function(req, res, next) {
	console.log(111)
	if (req.headers.authorization) { //如果请求头有token，那么往下走，用户在做在线操作，需要进行实时保存
		next()
	} else { //如果没有token，直接返回不往下走，这是用户在做离线操作
		res.json({
			code: '离线操作'
		})
	}

});

app.use('/', indexRouter);






// catch 404 and forward to error handler
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
