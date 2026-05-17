const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const projectRoot = __dirname;
const isEasBuild = process.env.EAS_BUILD === "true";

let config = getDefaultConfig(projectRoot);

// Rork metro transformer can break production bundles on EAS — use default Metro there
if (!isEasBuild) {
  config = withRorkMetro(config);
}

config.resolver = {
  ...config.resolver,
  alias: {
    ...(config.resolver?.alias ?? {}),
    "@": projectRoot,
  },
};

module.exports = config;
