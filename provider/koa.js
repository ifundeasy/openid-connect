/* eslint-disable no-console */

require('dotenv').config();

const path = require('path');
const { promisify } = require('util');

const render = require('koa-ejs');
const helmet = require('helmet');

const { Provider } = require('oidc-provider');

const Account = require('./support/account');
const configuration = require('./support/configuration');
const routes = require('./routes/koa');

const { PORT, ISSUER } = process.env;
configuration.findAccount = Account.findAccount;

let server;

(async () => {
  // const adapter = require('./adapters/local');
  // const adapter = require('./adapters/mongodb');
  const adapter = require('./adapters/sql');
  await adapter.connect()

  const prod = process.env.NODE_ENV === 'production';
  const provider = new Provider(ISSUER, { adapter, ...configuration });
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
    root: path.join(__dirname, 'views'),
  });
  provider.use(routes(provider).routes());
  server = provider.listen(PORT, () => {
    console.log(`application is listening on port ${PORT}, check its /.well-known/openid-configuration`);
  });
})().catch((err) => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exitCode = 1;
});