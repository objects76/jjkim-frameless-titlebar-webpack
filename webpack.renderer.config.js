const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const baseconfig = require("./webpack.base.config");
const buildPath = path.resolve(__dirname, "dist");

module.exports = (env, options) => {
  const base = baseconfig(env, options);
  const config = {
    ...base,
    entry: {
      index: "./src/index.js",
    },
    output: {
      ...base.output,
      path: buildPath,
    },

    plugins: [
      ...base.plugins,
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        favicon: "./public/favicon.ico",
        manifest: "./public/manifest.json",
      }),
      new CopyPlugin({
        patterns: [
          { from: "./public/manifest.json" },
          //{ from: "./public/static", to: "static" },
        ],
      }),
    ],

    //-------------------------------------------------------------
    // abs include path:
    //  - https://engineering.huiseoul.com/리액트-상대경로-절대경로-변경-1485babb5198
    resolve: {
      modules: [path.join(__dirname, "src"), "node_modules"],
    },

    //-------------------------------------------------------------
    // webpack-dev-server config.
    devServer: {
      contentBase: __dirname + `/dist/renderer`,
      inline: true,
      hot: true,
      host: "localhost",
      port: 5500,
    },

    target: "electron-renderer",
  };

  return config;
};
