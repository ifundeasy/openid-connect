const Router = require('koa-router')
const appController = require('./controllers')

const { BASE_URI, AUTH_CLIENT_CALLBACK } = process.env
const callbackPath = AUTH_CLIENT_CALLBACK.replace(BASE_URI, '')

module.exports = () => {
  const router = new Router()

  const {
    home,
    authorizationCode,
    password,
    callback,
    registration,
    clientCredentials,
    refreshToken,
    getXResource,
    getYResource
  } = appController()

  router.get('/', home)
  router.get('/authorization-code', authorizationCode)
  router.get('/password', password)
  router.get(callbackPath, callback)
  router.get('/registration', registration)
  router.get('/client-credentials', clientCredentials)
  router.get('/refresh-token', refreshToken)
  router.get('/abc', getXResource)
  router.get('/xyz', getYResource)

  return router
}
