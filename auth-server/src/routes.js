const Router = require('koa-router')
const { koaBody } = require('koa-body')

const {
  interaction,
  interactionAbort,
  interactionConfirmation,
  interactionRepost,
  interactionFederated,
  interactionLogin,
  registration
} = require('./controllers')

const { onlyClient, noCache, bodyParser } = require('./middlewares')

module.exports = async (provider) => {
  const router = new Router()

  const { errors: { SessionNotFound } } = await import('oidc-provider');

  router.post('/registration', koaBody(), onlyClient(provider), registration)
  
  router.use(noCache(SessionNotFound))
  router.get('/interaction/:uid', interaction(provider))
  router.get('/interaction/callback/google', interactionRepost)
  router.post('/interaction/:uid/login', bodyParser, interactionLogin(provider))
  router.post('/interaction/:uid/federated', bodyParser, interactionFederated(provider))
  router.post('/interaction/:uid/confirm', bodyParser, interactionConfirmation(provider))
  router.get('/interaction/:uid/abort', interactionAbort(provider))

  return router
}
