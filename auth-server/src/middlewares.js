const { renderError } = require('oidc-provider/lib/helpers/defaults')();

const bodyParser = require('koa-body')({
  text: false,
  json: false,
  patchNode: true,
  patchKoa: true,
})

const noCache = (SessionNotFound) => async (ctx, next) => {
  ctx.set('cache-control', 'no-cache, no-store')
  try {
    await next()
  } catch (err) {
    if (err instanceof SessionNotFound) {
      ctx.status = err.status
      const { message: error, error_description } = err
      renderError(ctx, { error, error_description }, err);
      console.log({ error, error_description })
    } else {
      throw err
    }
  }
}

const onlyClient = (provider) => async (ctx, next) => {
  const clientCredentials = await provider.ClientCredentials.find(ctx.request.body.token)
  if (clientCredentials) {
    await next()
  } else {
    ctx.status = 401
    ctx.message = 'UNAUTHORIZED'
    return
  }
}

module.exports = { bodyParser, noCache, onlyClient }
