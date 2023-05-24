const { koaBody } = require('koa-body')

const noCache = (SessionNotFound) => async (ctx, next) => {
  const { default: RenderError } = await import('oidc-provider/lib/helpers/defaults.js');
  const renderError = RenderError()

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

module.exports = {
  bodyParser: koaBody({
    text: false,
    json: false,
    patchNode: true,
    patchKoa: true,
  }),
  noCache,
  onlyClient
}
