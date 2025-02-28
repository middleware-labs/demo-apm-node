const tracker = require("@middleware.io/node-apm");
const logEnvVariables = require('./utils')

process.env.MW_SERVICE_NAME = "mew-agent-simple-express-app";
process.env.MW_API_KEY = "api_key";
//process.env.MW_DEBUG = "true";

logEnvVariables();

console.log("STARTING SERVERLESS MODE");

tracker.track({
    serviceName: process.env.MW_SERVICE_NAME,
    accessToken: process.env.MW_API_KEY,
    DEBUG: process.env.MW_DEBUG ? true : false,
    disabledInstrumentations: "net,dns",
  });
