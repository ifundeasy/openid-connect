const codeChallengeMethod = 'S256'
const { BASE_URI, AUTH_HOST, AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, AUTH_CLIENT_CALLBACK, AUTH_CLIENT_SCOPES, RESOURCE_HOST } = process.env

module.exports = () => ({
  home: async (ctx) => {
    return ctx.render('home', {
      title: 'Home',
      grantTypes: [
        { url: `${BASE_URI}/oauth-authorization-code-grant`, name: 'Authorization code', available: true, comments: '' },
        { url: `${BASE_URI}/oauth-client-credentials-grant`, name: 'Client credentials', available: true, comments: '' },
        { url: `${BASE_URI}/oauth-implicit-grant`, name: 'implicit', available: false, comments: '' },
        { url: `${BASE_URI}/oauth-password-grant`, name: 'Password', available: true, comments: 'legacy' },
      ],
      pages: [
        { url: `${BASE_URI}/abc`, name: 'Get abc resource', comments: 'using token introspection' },
        { url: `${BASE_URI}/xyz`, name: 'Get xyz resource', comments: 'public key decoding' },
        { url: `${BASE_URI}/oauth-user-registration`, name: 'User registration', comments: '' }
      ]
    })
  },
  oauthAuthorizationCodeGrant: async (ctx) => {
    return ctx.render('oauth-authorization-code-grant', {
      title: 'Authorization code',
      authServerUrl: `${AUTH_HOST}/auth`,
      callbackUrl: AUTH_CLIENT_CALLBACK,
      clientId: AUTH_CLIENT_ID,
      grantType: 'authorization_code',
      responseType: 'code',
      apiUrl: `${RESOURCE_HOST}/abc`,
      scopes: AUTH_CLIENT_SCOPES.replace(/\,/g, ' '),
      prompt: 'consent',
      codeChallengeMethod,
    })
  },
  oauthPasswordGrant: async (ctx) => {
    return ctx.render('oauth-password-grant', {
      title: 'Login',
      authServerUrl: `${AUTH_HOST}/token`,
      clientId: AUTH_CLIENT_ID,
      clientSecret: AUTH_CLIENT_SECRET,
      grantType: 'password',
      apiUrl: `${RESOURCE_HOST}/abc`,
      scopes: AUTH_CLIENT_SCOPES.replace(/\,/g, ' '),
      prompt: 'consent',
      username: 'sample',
      password: 'pass',
    })
  },
  oauthCallback: async (ctx) => {
    if ('error' in ctx.query) {
      ctx.throw(401, `${ctx.query.error}: ${ctx.query.error_description}`)
    } else {
      return ctx.render('oauth-callback', {
        title: 'Callback',
        code: ctx.query.code,
        authServerUrl: AUTH_HOST,
        callbackUrl: AUTH_CLIENT_CALLBACK,
        clientId: AUTH_CLIENT_ID,
        clientSecret: AUTH_CLIENT_SECRET,
        scopes: AUTH_CLIENT_SCOPES.replace(/\,/g, ' '),
        codeChallengeMethod,
      })
    }
  },
  oauthUserRegistration: async (ctx) => {
    return ctx.render('oauth-user-registration', {
      title: 'Registration',
      authServerUrl: `${AUTH_HOST}/registration`,
    })
  },
  oauthClientCredentials: async (ctx) => {
    return ctx.render('oauth-client-credentials-grant', {
      title: 'Client login',
      authServerUrl: `${AUTH_HOST}/token`,
      clientId: AUTH_CLIENT_ID,
      clientSecret: AUTH_CLIENT_SECRET,
      grantType: 'client_credentials',
      scopes: 'openid',
    })
  },
  getXResource: async (ctx) => {
    return ctx.render('get-abc-resource', { title: 'Get ABC resource', apiUrl: `${RESOURCE_HOST}/abc` })
  },
  getYResource: async (ctx) => {
    return ctx.render('get-xyz-resource', { title: 'Get XYZ resource', apiUrl: `${RESOURCE_HOST}/xyz` })
  },
})
