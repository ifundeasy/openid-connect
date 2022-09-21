# test-openid

This is an example code for implements:
- [OpenID Connect Provider](https://github.com/panva/node-oidc-provider) as [auth server](auth-server)
- Rest API as [resource server](resource-server)
- Web app as [client](web-client)

## preparation
Generate asymmetric secret key, by running the following command
```sh
bash ./asymmetric-keypair.sh 2048
```

## how to run
Please refer to the documentation for more information
- [auth-server](auth-server/README.md)
- [resource-server](resource-server/README.md)
- [client](web-client/README.md)