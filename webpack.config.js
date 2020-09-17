const mainConfig = require("./webpack.main.config");
const rendererConfig = require("./webpack.renderer.config");

module.exports = (env, options) => {
  options.mode = "development"; // override.
  const config = [mainConfig(env, options), rendererConfig(env, options)];
  return config;
};
