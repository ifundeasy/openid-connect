// * This frontend code is based on https://medium.com/@nitesh_17214/how-to-create-oidc-client-in-nodejs-b8ea779e0c64
// * He also told another way to create an oidc provider https://medium.com/@nitesh_17214/oauth-2-0-authorization-server-using-nodejs-and-expressjs-cf65860fed1e

const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const passport = require('passport')

const { Issuer, Strategy } = require('openid-client')

const {
  URI,
  MY_OAUTH_HOST,
  MY_OAUTH_CLIENT_ID: client_id,
  MY_OAUTH_CLIENT_SECRET: client_secret,
  MY_OAUTH_REDIRECT_URIS: redirect_uris,
  MY_OAUTH_SCOPE: scope,
} = process.env

module.exports = async () => {
  const app = express()
  const defaultRedirectPath = redirect_uris.split(',')[0].replace(URI, '')

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

  // * this will getting configuration from $MY_OAUTH_HOST/.well-known/openid-configuration
  const issuer = await Issuer.discover(MY_OAUTH_HOST);

  // * see this log for scope information you can get from $MY_OAUTH_HOST
  console.log(issuer)

  const client = new issuer.Client({
    client_id,
    client_secret,
    grant_types: ['authorization_code'],
    redirect_uris: redirect_uris.split(','),
    response_types: ['code']
  })

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
    passport.authenticate('oidc', { scope })
  )

  app.get('/refresh_token', async function (req, res, next) {
    console.log('@ /refresh_token', req.session)
    try {
      const { tokenSet } = req.session.passport.user
      const refresh = await client.refresh(tokenSet.refresh_token)
      res.send(refresh)
    } catch (e) {
      next(e)
    }
  })

  app.get(defaultRedirectPath, (req, res, next) => {
    console.log(`@ ${defaultRedirectPath}`, req.session)
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
    console.log(req.session.passport)
    const { tokenSet, userinfo, claims } = req.session.passport.user
    res.end(JSON.stringify({ tokenSet, userinfo, claims }, null, 2))
  })

  return app
}
