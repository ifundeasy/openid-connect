const { parsed: env } = require('dotenv').config();

module.exports = {
  username: env.SQL_USER,
  password: env.SQL_PASS,
  database: env.SQL_DB,
  host: env.SQL_HOST,
  port: env.SQL_PORT,
  dialect: env.SQL_DIALECT,
  logConnection: env.NODE_ENV !== 'production',
  logQueryParameters: false,
  migrationStorage: 'sequelize',
  migrationStorageTableName: '_meta',
  seederStorage: 'sequelize',
  seederStorageTableName: '_seed',
}