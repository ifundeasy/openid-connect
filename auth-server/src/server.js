/* eslint-disable no-console */

require('dotenv').config();

const path = require('path');
const { promisify } = require('util');
const render = require('koa-ejs');
const helmet = require('helmet');
const { Provider } = require('oidc-provider');

const { gty, parameters, passwordHandler } = require("./grant.password");
const routes = require('../src/routes');
const configuration = require('../config/oidc');
const Account = require('../utils/account');
const JwkImporter = require('../utils/jwk-importer');

const { NODE_ENV, PORT, BASE_URL, ADAPTER } = process.env;
const isProd = NODE_ENV === 'production';

module.exports = async () => {
  let adapter;
  switch (ADAPTER) {
    case 'sql':
      adapter = require('../adapters/sql');
      await adapter.connect()
      break;
    case 'mongodb':
      adapter = require('../adapters/mongodb');
      await adapter.connect()
      break;
    default:
      adapter = require('../adapters/local');
      break;
  }

  const jwkImporter = new JwkImporter();
  const privateJwk1 = await jwkImporter.private(
    path.join(__dirname, '../certificates/private.pkcs8.key'),
    'RS256'
  );
  configuration.findAccount = Account.findAccount;
  // * for example value please refer to ../.data/jwks.js
  configuration.jwks = {
    // * You can use multiple asymmetric keys https://github.com/panva/node-oidc-provider/tree/main/docs#jwks
    keys: [privateJwk1]
  }

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

  if (isProd) {
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