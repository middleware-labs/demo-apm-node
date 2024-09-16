const tracker = require("@middleware.io/node-apm");
const logEnvVariables = require("./utils");

process.env.MW_SERVICE_NAME = "simple-express-app";
process.env.MW_API_KEY = "api_key";
process.env.MW_TARGET = "https://<uid>.middleware.io";
process.env.MW_DEBUG = "true";

logEnvVariables();

console.log("STARTING SERVERLESS MODE");

tracker.track({
  serviceName: process.env.MW_SERVICE_NAME || "simple-express-app",
  agentService: process.env.MW_AGENT_SERVICE,
  accessToken: process.env.MW_API_KEY,
  target: process.env.MW_TARGET,
  DEBUG: process.env.MW_DEBUG ? true : false,
  disabledInstrumentations: "net,dns",
});
