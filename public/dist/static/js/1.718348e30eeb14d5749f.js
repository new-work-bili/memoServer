webpackJsonp([1],{OlBd:function(t,e,n){"use strict";n.d(e,"b",function(){return r}),n.d(e,"a",function(){return o});var c=n("TE7m"),r=(n("IcnI"),function(t,e){return c.a.post(t,e)}),o=function(t,e){return c.a.get(t,{params:e})}},dA4M:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});n("NYxO");var c=n("OlBd"),r={data:function(){return{}},methods:{getQQ:function(){var t=this;Object(c.a)("/memo/qqlogin/",this.$route.query).then(function(e){var n=e.data.userData;t.$store.commit("setUserName",n.account),t.$store.commit("setToken",e.data.token);var c=document.createElement("a");c.href="/",setTimeout(function(){c.click()},1500)}).catch(function(t){var e=document.createElement("a");e.href="/",setTimeout(function(){e.click()},1500)})}},mounted:function(){this.getQQ(),console.log("qqlogin")}},o={render:function(){var t=this.$createElement;return(this._self._c||t)("div",{staticClass:"wrapper"},[this._v("\n\t登陆成功!\n")])},staticRenderFns:[]};var u=n("VU/8")(r,o,!1,function(t){n("kcjK")},null,null);e.default=u.exports},kcjK:function(t,e){}});
//# sourceMappingURL=1.718348e30eeb14d5749f.js.map