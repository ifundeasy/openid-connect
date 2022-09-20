// require('./koa')
require('./express')

process.on('uncaughtException', (error, source) => {
  console.error('@ uncaughtException!!', error)
});