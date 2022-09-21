const { Op } = require('sequelize')

const clientIds = [];
const clients = require('../.data/clients').map(client => {
  clientIds.push(client.client_id);
  return { id: client.client_id, data: JSON.stringify(client) }
})

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Clients', clients)
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Clients', {
      id: { [Op.in]: clientIds }
    })
  },
}
