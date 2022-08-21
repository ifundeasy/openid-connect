module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Clients', [
      {
        id: 'MY_OAUTH_CLIENT_ID',
        data: JSON.stringify({
          client_id: 'MY_OAUTH_CLIENT_ID',
          grant_types: ['refresh_token', 'authorization_code'],
          client_secret: 'MY_SECRET_IS_1234',
          redirect_uris: ['http://localhost:4000/login/callback'],
        })
      }
    ])
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Clients', {
      id: 'MY_OAUTH_CLIENT_ID',
    })
  },
}
