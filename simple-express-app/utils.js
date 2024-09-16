module.exports = function logEnvVariables() {
  console.log({
    serviceName: process.env.MW_SERVICE_NAME,
    agentService: process.env.MW_AGENT_SERVICE,
    accessToken: process.env.MW_API_KEY,
    target: process.env.MW_TARGET,
    DEBUG: process.env.MW_DEBUG,
  });
};
