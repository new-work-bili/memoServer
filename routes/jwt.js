//认证token
const jwt = require('express-jwt');
const { PRIVATE_KEY } = require('../config.js');

const jwtAuth = jwt({
  secret: PRIVATE_KEY,
  credentialsRequired: false // 设置为false就不进行校验了，游客也可以访问
}).unless({
  path: [
    '/',
    '/login/',
	'/login/registe/',
	'/memo/qqlogin',
	'/memo/qqlogin/'
  ], // 设置 jwt 认证白名单
});

module.exports = jwtAuth;
