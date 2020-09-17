const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

const baseconfig = require("./webpack.base.config");
const buildPath = path.resolve(__dirname, "dist", "main");

module.exports = (env, options) => {
  console.log(options);
  const base = baseconfig(env, options);
  const config = {
    ...base,
    entry: {
      main: "./elec/main.js",
    },
    output: {
      ...base.output,
      path: buildPath,
    },
    node: {
      __dirname: false,
      __filename: false,
    },

    plugins: [
      ...base.plugins,
      new CopyPlugin({
        patterns: [{ from: "./elec/preload.js" }],
      }),
    ],
    target: "electron-main",
  };
  return config;
};
