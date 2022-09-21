const codeChallengeMethod = 'S256'
const { AUTH_HOST, AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, AUTH_CLIENT_CALLBACK, AUTH_CLIENT_SCOPES, RESOURCE_HOST } = process.env

module.exports = () => ({
  init: async (ctx) => {
    return ctx.render('init', {
      title: 'Fill your existing client',
      authServerUrl: AUTH_HOST,
      apiUrl: RESOURCE_HOST,
      callbackUrl: AUTH_CLIENT_CALLBACK,
      clientId: AUTH_CLIENT_ID,
      prompt: 'consent',
      scopes: AUTH_CLIENT_SCOPES.replace(/\,/g, ' '),
      codeChallengeMethod,
    })
  },
  login: async (ctx) => {
    return ctx.render('login', {
      title: 'User login',
      authServerUrl: AUTH_HOST,
      apiUrl: RESOURCE_HOST,
      clientId: AUTH_CLIENT_ID,
      clientSecret: AUTH_CLIENT_SECRET,
      grantType: 'password',
      scopes: AUTH_CLIENT_SCOPES.replace(/\,/g, ' '),
      prompt: 'consent',
      username: 'sample',
      password: 'pass',
    })
  },
  loginCallback: async (ctx) => {
    if ('error' in ctx.query) {
      ctx.throw(401, `${ctx.query.error}: ${ctx.query.error_description}`)
    } else {
      return ctx.render('login-callback', {
        code: ctx.query.code,
        title: 'App Callback',
        authServerUrl: AUTH_HOST,
        callbackUrl: AUTH_CLIENT_CALLBACK,
        clientId: AUTH_CLIENT_ID,
        clientSecret: AUTH_CLIENT_SECRET,
        scopes: AUTH_CLIENT_SCOPES.replace(/\,/g, ' '),
        codeChallengeMethod,
      })
    }
  },
  registration: async (ctx) => {
    return ctx.render('registration', {
      title: 'Registering User',
      authServerUrl: AUTH_HOST,
    })
  },
  loginClient: async (ctx) => {
    return ctx.render('login-client', {
      title: 'Client login',
      authServerUrl: AUTH_HOST,
      clientId: AUTH_CLIENT_ID,
      clientSecret: AUTH_CLIENT_SECRET,
      grantType: 'client_credentials',
      scopes: 'openid',
    })
  },
  pi: async (ctx) => {
    return ctx.render('pi', { title: 'PI', apiUrl: RESOURCE_HOST })
  },
})
