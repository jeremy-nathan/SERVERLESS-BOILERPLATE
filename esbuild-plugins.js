/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const { nodeExternalsPlugin } = require('esbuild-node-externals');
const esbuildPluginTsc = require('@emarketeer/esbuild-plugin-tsc');

// default export should be an array of plugins
module.exports = [esbuildPluginTsc()];
