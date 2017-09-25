'use strict';

const path = require('path');

const AV = require('leanengine');
const Koa = require('koa');
const Router = require('koa-router');
const views = require('koa-views');
const statics = require('koa-static');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const wechat = require('../controllers/wechat');
const jsonp = require('../controllers/jsonp');

// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./cloud');

const app = new Koa();
app.use(cors());

const router = new Router();
app.use(router.routes());

// 加载云引擎中间件
app.use(AV.koa());

app.use(bodyParser());

var appUserModuleRouters = function (app, moduleRouters) {
  for (var key in moduleRouters) {
    if (moduleRouters.hasOwnProperty(key)) {
      // 可以将一类的路由单独保存在一个文件中
      app.use(moduleRouters[key].routes());
    }
  }
}

var moduleRouters = {
  wechat: wechat,
  jsonp: jsonp
};
appUserModuleRouters(app, moduleRouters);

// // 可以将一类的路由单独保存在一个文件中
// app.use(require('./routes/todos').routes());

module.exports = app;
