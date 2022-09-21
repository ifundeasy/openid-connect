/* eslint-disable no-console */

require('dotenv').config();

const { PORT, BASE_URL } = process.env;

const path = require('path');
const { promisify } = require('util');
const render = require('koa-ejs');
const helmet = require('helmet');
const { Provider, Configuration } = require('oidc-provider');

const { gty, parameters, passwordHandler } = require("./grant.password");
const routes = require('../src/routes');
const configuration = require('../config/oidc');
const Account = require('../utils/account');
configuration.findAccount = Account.findAccount;

module.exports = async () => {
  // const adapter = require('../adapters/local');
  // const adapter = require('../adapters/mongodb');
  const adapter = require('../adapters/sql');
  await adapter.connect()

  const prod = process.env.NODE_ENV === 'production';

  const provider = new Provider(BASE_URL, { adapter, ...configuration });
  provider.registerGrantType(gty, passwordHandler, parameters);

  const directives = helmet.contentSecurityPolicy.getDefaultDirectives();
  delete directives['form-action'];

  const pHelmet = promisify(helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives,
    },
  }));

  provider.use(async (ctx, next) => {
    const origSecure = ctx.req.secure;
    ctx.req.secure = ctx.request.secure;
    await pHelmet(ctx.req, ctx.res);
    ctx.req.secure = origSecure;
    return next();
  });

  if (prod) {
    provider.proxy = true;
    provider.use(async (ctx, next) => {
      if (ctx.secure) {
        await next();
      } else if (ctx.method === 'GET' || ctx.method === 'HEAD') {
        ctx.status = 303;
        ctx.redirect(ctx.href.replace(/^http:\/\//i, 'https://'));
      } else {
        ctx.body = {
          error: 'invalid_request',
          error_description: 'do yourself a favor and only use https',
        };
        ctx.status = 400;
      }
    });
  }
  render(provider.app, {
    cache: false,
    viewExt: 'ejs',
    layout: '_layout',
    root: path.join(__dirname, '../views'),
  });

  provider.use(routes(provider).routes());
  server = provider.listen(PORT, () => {
    console.log(`application is listening on port ${PORT}, check its ${BASE_URL}/.well-known/openid-configuration`);
  });

  return server;
}