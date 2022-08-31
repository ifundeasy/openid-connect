/* eslint-disable no-console */

require('dotenv').config();

const { PORT, ISSUER } = process.env;

const path = require('path');
const url = require('url');
const express = require('express'); // eslint-disable-line import/no-unresolved
const helmet = require('helmet');
const { Provider } = require('oidc-provider');

const configuration = require('./support/configuration');
const Account = require('./support/account');
configuration.findAccount = Account.findAccount;

const app = express();
const routes = require('./routes/express');

const directives = helmet.contentSecurityPolicy.getDefaultDirectives();
delete directives['form-action'];
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives,
  },
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

let server;
(async () => {
  // const adapter = require('./adapters/local');
  // const adapter = require('./adapters/mongodb');
  const adapter = require('./adapters/sql');
  await adapter.connect()

  const provider = new Provider(ISSUER, { adapter, ...configuration });

  if (process.env.NODE_ENV === 'production') {
    app.enable('trust proxy');
    provider.proxy = true;

    app.use((req, res, next) => {
      if (req.secure) {
        next();
      } else if (req.method === 'GET' || req.method === 'HEAD') {
        res.redirect(url.format({
          protocol: 'https',
          host: req.get('host'),
          pathname: req.originalUrl,
        }));
      } else {
        res.status(400).json({
          error: 'invalid_request',
          error_description: 'do yourself a favor and only use https',
        });
      }
    });
  }

  routes(app, provider);
  app.use(provider.callback());
  server = app.listen(PORT, () => {
    console.log(`application is listening on port ${PORT}, check its /.well-known/openid-configuration`);
  });
})().catch((err) => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exitCode = 1;
});