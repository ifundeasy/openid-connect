# auth-server

## installation

```bash
cp .env.example .env && vi .env
npm i
npm run sql:create
npm run sql:migrate
npm run sql:seed:all
```

## run

```bash
npm start
```

## todo
1. When request data to resource-server: pick correct scopes
2. When using JWT as access_token: no data inserted to AccessToken, AuthorizationCode, DeviceCodes, or RefreshToken
3. When adapter is MongoDB: Need initial clients for mongodb (seeder)