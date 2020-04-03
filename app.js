var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')

const jwtAuth = require('./routes/jwt.js')		//token验证
const {token_ERR} = require('./config.js');
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var QQ = require('./routes/QQ');
const history = require('connect-history-api-fallback')	//应对vue的history

var app = express();


// history({
//   rewrites: [
//         {
//           from: /^\/api\/.*$/,
//           to: function(context) {
//               return context.parsedUrl.path
//           }
//         }
//       ]
// })



//设置跨域访问
app.use(cors());
//应对vue的history
// app.use(history())

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
app.use('/',QQ)

//在这个前面写登陆，注销，注册
app.use(function(req, res, next) {
	console.log(111)
	if(req.headers.authorization){	//如果请求头有token，那么往下走，用户在做在线操作，需要进行实时保存
		next()
	}else{							//如果没有token，直接返回不往下走，这是用户在做离线操作
		res.json({
			code:'离线操作'
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
	console.log(222)
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	
	console.log('app.js>err:',err)
	//token错误时，err中的name的值，具体token报错信息见https://www.jianshu.com/p/9b71a1582c40
	if (err.name == 'UnauthorizedError') {
		console.log(err)
		res.json({
			code:token_ERR,
			error:err.status,
			errorMsg:err.message
		})
		return
	}
	res.status(err.status || 500);
	res.render('error');
});
module.exports = app;
