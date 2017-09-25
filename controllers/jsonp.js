const Router = require('koa-router');
const request = require('request');
const jsonpBody = require('jsonp-body');

const router = new Router({prefix: '/v1/api/jsonp'});

router.get('/jsonp_proxy', (ctx) => {
  const req = ctx.request;
  var domin = req.protocol + '://' + req.header('host');
  var method = req.query.method;
  var path = decodeURIComponent(req.query.path);
  var params = req.query.params;
  if (params) {
    params = JSON.parse(decodeURIComponent(params))
  }
  var callback = req.query.callback;

  var fn = request[method];
  var url = domin + path;

  fn(url, (error, response, body) => {
    ctx.set('X-Content-Type-Options', 'nosniff');
    ctx.type = 'text/javascript';
    if (callback && typeof callback === 'string') {
      result = '/**/ typeof ' + callback + ' === \'function\' && ' + callback + '(' + body + ');';
      ctx.body = result;
    } else {
      ctx.body = jsonpBody(body, callback, {});
    }
  });
});

module.exports = router;
