require('dotenv').config()

const Koa = require('koa')
const render = require('koa-ejs')
const koaStatic = require('koa-static')
const path = require('path')

const router = require('./routes')

const { BASE_URI, PORT } = process.env

const app = new Koa()
render(app, {
  cache: false,
  viewExt: 'ejs',
  layout: false,
  root: path.resolve('views'),
})

app.use(koaStatic(path.resolve('public')))
app.use(router().routes())

app.listen(PORT, () => {
  console.log(`web-client listening on port ${PORT}, check ${BASE_URI}`)
})
