module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Clients', [
      {
        id: 'MY_OAUTH_CLIENT_ID',
        data: JSON.stringify({
          client_id: 'MY_OAUTH_CLIENT_ID',
          client_secret: 'MY_SECRET_IS_1234',
          grant_types: ['refresh_token', 'authorization_code'],
          redirect_uris: ['http://localhost:4000/login/callback', 'https://oidcdebugger.com/debug'],
          response_types: ['code', 'id_token', 'code id_token', 'none'],
        }),
      },
    ])
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Clients', {
      id: 'MY_OAUTH_CLIENT_ID',
    })
  },
}
