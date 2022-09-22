module.exports = [
  {
    client_id: 'web-app-as-client',
    client_secret: 'web-app-as-client',
    // redirect_uris: ['http://localhost:4000/callback', 'https://oidcdebugger.com/debug'],
    redirect_uris: ['http://localhost:4000/callback'],
    grant_types: ['authorization_code', 'refresh_token', 'client_credentials', 'password'],
    scope: 'openid email profile phone address offline_access',
  },
  {
    client_id: 'rest-api-as-resource-server',
    client_secret: 'rest-api-as-resource-server',
    // redirect_uris: ['https://oidcdebugger.com/debug'],
    redirect_uris: [],
    response_types: [],
    grant_types: ['client_credentials'],
    scope: 'openid email profile phone address',
  },
]
