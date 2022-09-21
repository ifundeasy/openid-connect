const Accounts = require('../.data/accounts')

const accounts = new Map();

Accounts.forEach(el => accounts.set(el.username, el));


const get = async (key) => accounts.get(key)
const set = async (key, value) => accounts.set(key, value)

module.exports = { get, set }
