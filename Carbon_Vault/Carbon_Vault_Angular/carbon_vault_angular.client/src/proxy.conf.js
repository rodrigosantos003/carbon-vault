const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7210';

const PROXY_CONFIG = [
  {
    "/api": {
      "target": "https://localhost:7117",
      "secure": false,
      "changeOrigin": true,
      "logLevel": "debug"
    }
  }
  
]

module.exports = PROXY_CONFIG;
