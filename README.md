# 介绍
**memoGo: 基于vue框架的备忘录网站，支持第三方登陆、云同步，支持日历任务功能(此项目为server端)**
**网站地址:[memoGo](http://lppwork.cn/)**
**github地址:[memoGo](https://github.com/new-work-bili/memoGo)**

# 实现功能(node端)
+	配合官方接口实现QQ第三方登陆
+	基于token的登录机制，并配合使用express-jwt实现token的续签
+	对morgan中间件进行深度封装，实现倒写日志的功能
+	使用pm2对node进程进行守护