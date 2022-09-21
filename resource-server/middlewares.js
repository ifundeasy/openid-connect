const jwt = require('jsonwebtoken');
const { join } = require('path')
const { existsSync, readFileSync } = require('fs')

const { AUTH_HOST, AUTH_CLIENT_ID, AUTH_CLIENT_SECRET } = process.env

const fetch = async (...args) => {
  const { default: lib } = await import('node-fetch')
  return lib(...args)
}

const authenticate = async (ctx, next) => {
  const body = new URLSearchParams()
  
  if (!ctx.request.headers.authorization) return ctx.throw(401)
  
  body.append('token', ctx.request.headers.authorization.replace(/^Bearer /, ''))
  body.append('client_id', AUTH_CLIENT_ID)
  body.append('client_secret', AUTH_CLIENT_SECRET)

  const url = `${AUTH_HOST}/token/introspection`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ['Content-Type']: 'application/x-www-form-urlencoded',
    },
    body
  })

  if (response.status !== 200) ctx.throw(401)
  const json = await response.json()
  const { active, aud = '' } = json

  // Resource URI and audience (aud) must be equal
  if (active && aud.trim() === ctx.request.href.split('?')[0]) {
    ctx.state.session = json
    await next()
  } else {
    ctx.throw(401)
  }
}

const selfAuthenticate = async (ctx, next) => {
  if (!ctx.request.headers.authorization) return ctx.throw(401)
  
  const access_token = ctx.request.headers.authorization.replace(/^Bearer /, '');
  
  let publicKey = join('certificates', '/public.key');
  if (!existsSync(publicKey)) {
    ctx.status = 401;
    ctx.body = `The ${publicKey} file does not exist`;
    ctx.app.emit('error', new Error(ctx.body), ctx);
    
    return;
  }
  publicKey = readFileSync(publicKey);

  const decoded = await jwt.verify(
    access_token,
    publicKey,
    { algorithm: 'RS256' }
  )

  const { exp, aud = '' } = decoded
  const now = new Date().getTime() / 1000;

  // Resource URI and audience (aud) must be equal
  if ((now < exp) && (aud.trim() === ctx.request.href.split('?')[0])) {
    ctx.state.session = decoded
    await next()
  } else {
    ctx.throw(401)
  }
}

const authorize = (...scopes) => async (ctx, next) => {
  if (ctx.state.session && scopes.every((scope) => ctx.state.session.scope.includes(scope))) {
    await next()
  } else {
    ctx.throw(401)
  }
}

module.exports = {
  authenticate,
  selfAuthenticate,
  authorize
}