const Router = require('koa-router')
const appController = require('./controller')

const { BASE_URI, AUTH_CLIENT_CALLBACK } = process.env
const callbackPath = AUTH_CLIENT_CALLBACK.replace(BASE_URI, '')

module.exports = () => {
  const router = new Router()

  const { init, login, loginCallback, loginClient, registration, pi } = appController()

  router.get('/', init)
  router.get('/login', login)
  router.get(callbackPath, loginCallback)
  router.get('/registration', registration)
  router.get('/client-login', loginClient)
  router.get('/pi', pi)

  return router
}
