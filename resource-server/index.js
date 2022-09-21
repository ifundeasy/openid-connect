require('dotenv').config()

const cors = require('@koa/cors')
const Koa = require('koa')

const router = require('./routes')
const app = new Koa()

const { PORT, BASE_URI } = process.env;

app.use(cors())
app.use(router().routes())

app.listen(PORT, () => {
  console.log(`resource-server listening on port ${PORT}, check ${BASE_URI}`)
})
