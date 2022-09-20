module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Clients', [
      {
        id: 'MY_OAUTH_CLIENT_ID',
        data: JSON.stringify({
          client_id: 'MY_OAUTH_CLIENT_ID',
          client_secret: 'MY_SECRET_IS_1234',
          grant_types: ['authorization_code', 'refresh_token'],
          redirect_uris: ['http://localhost:4000/login/callback', 'https://oidcdebugger.com/debug'],
          response_types: ['code'],
          scope: 'openid offline_access address email phone profile',
          // token_endpoint_auth_method: "none",
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
