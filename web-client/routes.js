const Router = require('koa-router')
const appController = require('./controllers')

const { BASE_URI, AUTH_CLIENT_CALLBACK } = process.env
const callbackPath = AUTH_CLIENT_CALLBACK.replace(BASE_URI, '')

module.exports = () => {
  const router = new Router()

  const {
    home,
    oauthAuthorizationCodeGrant,
    oauthPasswordGrant,
    oauthCallback,
    oauthUserRegistration,
    oauthClientCredentials,
    getXResource,
    getYResource
  } = appController()

  router.get('/', home)
  router.get('/oauth-authorization-code-grant', oauthAuthorizationCodeGrant)
  router.get('/oauth-password-grant', oauthPasswordGrant)
  router.get(callbackPath, oauthCallback)
  router.get('/oauth-user-registration', oauthUserRegistration)
  router.get('/oauth-client-credentials-grant', oauthClientCredentials)
  router.get('/abc', getXResource)
  router.get('/xyz', getYResource)

  return router
}
