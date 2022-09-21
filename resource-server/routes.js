const Router = require('koa-router')

const { pi } = require('./controllers')
const { authenticate, selfAuthenticate, authorize } = require('./middlewares')

module.exports = () => {
  const router = new Router()

  router.get('/abc', authenticate, authorize('api:read'), pi)
  router.get('/xyz', selfAuthenticate, authorize('api:read'), pi)

  return router
}
