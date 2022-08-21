require('dotenv').config();

const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const passport = require('passport')
const http = require('http')

const { Issuer, Strategy } = require('openid-client')

const {
  PORT, URI,
  MY_OAUTH_HOST,
  MY_OAUTH_CLIENT_ID: client_id,
  MY_OAUTH_CLIENT_SECRET: client_secret
} = process.env

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
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
)
app.use(helmet())
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function (user, done) {
  console.log('> serialize user')
  console.log(user)
  done(null, user)
})
passport.deserializeUser(function (user, done) {
  console.log('> deserialize user')
  console.log(user)
  done(null, user)
})

Issuer.discover(MY_OAUTH_HOST).then(function (oidcIssuer) {
  var client = new oidcIssuer.Client({
    client_id,
    client_secret,
    grant_types: ['authorization_code'],
    redirect_uris: [`${URI}/login/callback`],
    response_types: ['code'],
  })

  passport.use(
    'oidc',
    new Strategy({ client, passReqToCallback: true }, (req, tokenSet, userinfo, done) => {
      console.log('tokenSet', tokenSet)
      console.log('userinfo', userinfo)
      req.session.tokenSet = tokenSet
      req.session.userinfo = userinfo
      return done(null, tokenSet.claims())
    })
  )
})

app.get('/login', function (req, res, next) {
    console.log('> start login handler')
    next()
  },
  passport.authenticate('oidc', { scope: 'openid' })
)

app.get('/login/callback', (req, res, next) => {
  passport.authenticate('oidc', {
    successRedirect: '/user',
    failureRedirect: '/',
  })(req, res, next)
})

app.get('/', (req, res) => {
  res.send(" <a href='/login'>Log In with OAuth 2.0 Provider </a>")
})

app.get('/user', (req, res) => {
  res.header('Content-Type', 'application/json')
  res.end(JSON.stringify({ tokenset: req.session.tokenSet, userinfo: req.session.userinfo }, null, 2))
})

http.createServer(app).listen(PORT, () => {
  console.log(`application is listening on port ${PORT}, go test to "${URI}/" endpoint`)
})
