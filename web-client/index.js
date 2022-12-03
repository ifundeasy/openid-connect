require('dotenv').config()

const http = require('http')
const App = require('./app')()
console.log()

const { PORT, URI } = process.env

App.then(app => {
  http.createServer(app).listen(PORT, () => {
    console.log(`application is listening on port ${PORT}, go test to "${URI}/" endpoint`)
  })
})