/* eslint-disable-line no-unused-vars */

const Config = {
  interactions: {
    url(ctx, interaction) {
      return `/interaction/${interaction.uid}`
    },
  },
  cookies: {
    keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more'],
  },
  claims: {
    address: ['address'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    profile: [
      'birthdate',
      'family_name',
      'gender',
      'given_name',
      'locale',
      'middle_name',
      'name',
      'nickname',
      'picture',
      'preferred_username',
      'profile',
      'updated_at',
      'website',
      'zoneinfo',
    ],
  },
  clientBasedCORS(ctx, origin, client) {
    // * for list of client id check ../sql-seeders/20190921125000-add-client.js
    // if (client.clientId === 'web-app-as-client') {
    //   return true  
    // }
    return true
  },
  features: {
    clientCredentials: { enabled: true },
    introspection: {
      enabled: true,
      allowedPolicy(ctx, client, token) {
        if (
          client.introspectionEndpointAuthMethod === "none" &&
          token.clientId !== ctx.oidc.client?.clientId
        ) {
          return false;
        }
        return true;
      },
    },
    devInteractions: { enabled: false }, // defaults to true
    deviceFlow: { enabled: true }, // defaults to false
    revocation: { enabled: true }, // defaults to false
    resourceIndicators: {
      enabled: true,
      defaultResource(ctx) {
        return Array.isArray(ctx.oidc.params?.resource)
          ? ctx.oidc.params?.resource[0]
          : ctx.oidc.params?.resource;
      },
      getResourceServerInfo(ctx, resourceIndicator, client) {
        // TODO: When request data to resource-server: pick correct scopes
        const scope = ctx.oidc.params.scope.split(' ').filter(s => s.indexOf(':') > -1).concat('offline_access').join(' ');
        
        const options = {
          scope: 'api:read offline_access',
        };

        // options.audience = resourceIndicator

        // TODO: When using JWT as access_token: no data inserted to AccessToken, AuthorizationCode, DeviceCodes, or RefreshToken
        // options.accessTokenTTL = 60 * 60, // 1 hours
        // options.jwt = {
        //   sign: { alg: 'RS256' },
        // }

        return options
      },
      async useGrantedResource(ctx, model) {
        return true;
      }
    },
  },
  ttl: {
    AccessToken: function AccessTokenTTL(ctx, token, client) {
      if (token.resourceServer) return token.resourceServer.accessTokenTTL;
      return 60 * 60; // 1 hour in seconds
    },
    AuthorizationCode: 600 /* 10 minutes in seconds */,
    BackchannelAuthenticationRequest:
      function BackchannelAuthenticationRequestTTL(ctx, request, client) {
        if (ctx && ctx.oidc && ctx.oidc.params?.requested_expiry) {
          return Math.min(10 * 60, ctx.oidc.params?.requested_expiry); // 10 minutes in seconds or requested_expiry, whichever is shorter
        }
        return 10 * 60; // 10 minutes in seconds
      },
    ClientCredentials: function ClientCredentialsTTL(ctx, token, client) {
      if (token.resourceServer) {
        return token.resourceServer.accessTokenTTL || 10 * 60; // 10 minutes in seconds
      }
      return 10 * 60; // 10 minutes in seconds
    },
    DeviceCode: 600 /* 10 minutes in seconds */,
    Grant: 1209600 /* 14 days in seconds */,
    IdToken: 3600 /* 1 hour in seconds */,
    Interaction: 3600 /* 1 hour in seconds */,
    RefreshToken: function RefreshTokenTTL(ctx, token, client) {
      if (
        ctx &&
        ctx.oidc.entities.RotatedRefreshToken &&
        client.applicationType === "web" &&
        client.tokenEndpointAuthMethod === "none" &&
        !token.isSenderConstrained()
      ) {
        // Non-Sender Constrained SPA RefreshTokens do not have infinite expiration through rotation
        return ctx.oidc.entities.RotatedRefreshToken.remainingTTL;
      }
      return 14 * 24 * 60 * 60; // 14 days in seconds
    },
    Session: 1209600 /* 14 days in seconds */,
  },
};

module.exports = Config