// * This frontend code is based on https://medium.com/@nitesh_17214/how-to-create-oidc-client-in-nodejs-b8ea779e0c64
// * He also told another way to create an oidc provider https://medium.com/@nitesh_17214/oauth-2-0-authorization-server-using-nodejs-and-expressjs-cf65860fed1e

require('dotenv').config()

const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const passport = require('passport')
const http = require('http')

const { Issuer, Strategy } = require('openid-client')

const {
  PORT,
  URI,
  MY_OAUTH_HOST: client_uri,
  MY_OAUTH_CLIENT_ID: client_id,
  MY_OAUTH_CLIENT_SECRET: client_secret,
  MY_OAUTH_CALLBACK_URI: client_cb_uri,
  MY_OAUTH_SCOPES: client_scopes,
} = process.env
const client_cb_path = client_cb_uri.replace(URI, '');

(async () => {
  const app = express()
  app.use(cookieParser())
  app.use(
    express.urlencoded({
      extended: true,
    })
  )

  app.use(express.json({ limit: '15mb' }))
  app.use(
    session({
      secret: 'some secret key',
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
    })
  )
  app.use(helmet())
  app.use(passport.initialize())
  app.use(passport.session())

  passport.serializeUser(function (user, done) {
    console.log('@ serialize', user)
    done(null, user)
  })
  passport.deserializeUser(function (user, done) {
    console.log('@ deserialize', user)
    done(null, user)
  })

  const issuer = await Issuer.discover(client_uri)
  console.log(issuer)

  const client = new issuer.Client({
    client_id,
    client_secret,
    grant_types: ['authorization_code'],
    // grant_types: ['authorization_code', 'refresh_token'],
    redirect_uris: [client_cb_uri],
    response_types: ['code'],
    // token_endpoint_auth_method: 'none',
  })
  console.log(client)

  passport.use(
    'oidc',
    new Strategy({ client, passReqToCallback: true }, (req, tokenSet, userinfo, done) => {
      const claims = tokenSet.claims()
      console.log('@ passport.use -> req.sessionID', req.sessionID)
      console.log('@ passport.use -> req.session', req.session)
      console.log('@ passport.use -> save to req.session.passport.user:', { tokenSet, userinfo, claims })
      return done(null, { tokenSet, userinfo, claims })
    })
  )

  app.get(
    '/login',
    function (req, res, next) {
      console.log('@ /login')
      next()
    },
    passport.authenticate('oidc', {
      // scope: 'api:read',
      scope: client_scopes.replace(/\,/g, ' '),
      // scope: client_scopes.replace(/\,/g, ' ') + ' api:read',
      // resource: 'https://api.example.com'
    })
  )

  app.get(client_cb_path, (req, res, next) => {
    console.log(`@ ${client_cb_path}`, req.session)
    // res.send('123')
    passport.authenticate('oidc', {
      successRedirect: '/user',
      failureRedirect: '/',
    })(req, res, next)
  })

  app.get('/', (req, res) => {
    res.send(" <a href='/login'>Log In with OAuth 2.0 Provider </a>")
  })

  app.get('/user', (req, res) => {
    console.log('@ /user', req.session)
    res.header('Content-Type', 'application/json')
    const { tokenSet, userinfo, claims } = req.session.passport.user
    res.end(JSON.stringify({ tokenSet, userinfo, claims }, null, 2))
  })

  http.createServer(app).listen(PORT, () => {
    console.log(`application is listening on port ${PORT}, go test to "${URI}/" endpoint`)
  })
})()

process.on('uncaughtException', (error, source) => {
  console.error('@ uncaughtException!!', error)
});
