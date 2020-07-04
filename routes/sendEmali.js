var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
	service: 'qq',
	secureConnection: true,
	port: 465,
	auth: {
		user: '2500717816@qq.com',
		pass: 'saihheuvtmfmdigg' //授权码
	}
});




router.post('/', function(req, res, next) {
	let text = req.body.text
	let defaultOpions = {
		from: '"JavaScript之禅" <2500717816@qq.com>', //好像没效果
		to: '1655170926@qq.com', //发送至
		subject: 'memoGo的反馈信息',		//主题(标题)
		text: 'text的？？？？？',
		html: `<b>${text}</b>`
	}
	transporter.sendMail(defaultOpions, (err, info) => {
		if (err) {
			console.error('sendEmaliErr:',err)
			res.json({
				code: -1,
				msg:'请求超时，请重试!'
			})
		} else {
			console.log('sendEmaliSucces:',err, info)
			res.json({
				code: 1,
				msg:'感谢您的建议!'
			})
		}
		
	})




});

module.exports = router;
