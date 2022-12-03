const jose = require('jose');
const uuid = require('uuid');
const { readFileSync } = require('fs');

class JwkImporter {
  constructor(keyId = uuid.v4(), usage = 'sig') {
    this.keyId = keyId;
    this.usage = usage;
  }

  async additionalProp(jwk) {
    Object.assign(jwk, { kid: this.keyId, use: this.usage })
  }

  async private(keyFile, alg) {
    let algorithms = alg;
    if (alg instanceof String) algorithms = [alg];

    const file = readFileSync(keyFile).toString();
    const key = await jose.importPKCS8(file, algorithms)

    const jwk = await jose.exportJWK(key)
    this.additionalProp(jwk)

    return jwk
  }

  async public(keyFile, alg) {
    let algorithms = alg;
    if (alg instanceof String) algorithms = [alg];

    const file = readFileSync(keyFile).toString();
    const key = await jose.importSPKI(file, algorithms)

    const jwk = await jose.exportJWK(key)
    this.additionalProp(jwk)

    return jwk
  }
}

module.exports = JwkImporter;
