const Server = require('./src/server')

process.on('uncaughtException', (error, source) => {
  console.error('@ uncaughtException!!', error)
});

Server().catch((err, server) => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exitCode = 1;
})