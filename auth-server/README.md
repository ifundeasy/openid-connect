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
1. Resource server should be make to dynamic