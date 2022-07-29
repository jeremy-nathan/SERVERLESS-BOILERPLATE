const dotenv = require('dotenv-flow');

module.exports = async ({ options, resolveConfigurationProperty }) => {
	// Load env vars into Serverless environment
	// You can do more complicated env var resolution with dotenv here
	const envVars = dotenv.config().parsed;
	return envVars;
};
