// https://webpack.js.org/concepts/

// webpack cli in package.json(react-hot-loader is needed?)
//  "webpack-dev-server --hot"
const path = require("path");
const webpack = require("webpack");
const { name: appname, version } = require("./package.json");

module.exports = (env, options) => {
  if (!options.mode) options.mode = "development";
  console.log(
    `---------------------- ${options.target}:${options.mode} ---------------------------`
  );

  const config = {
    mode: "development",
    devtool: "eval", // or hidden-source-map
    resolve: {
      extensions: [".jsx", ".js", ".ts", ".tsx", ".json"],
    },

    //------------------------------------------------------------
    // Entry
    // entry: {
    //   main: "./src/index.js",
    // },
    //------------------------------------------------------------
    // Outputs
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      // publicPath: "/dist",
    },

    //------------------------------------------------------------
    // Loaders
    module: {
      rules: [
        // typescript ----------------------------------------
        {
          test: /\.tsx?$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: "ts-loader",
            },
          ],
        },
        // react ---------------------------------------------
        {
          test: /\.jsx?$/,
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    browsers: ["last 1 chrome versions"],
                  },
                  // debug: true,
                },
              ],
              "@babel/preset-react",
            ],
            plugins: [],
          },
        },

        // css ---------------------------------------------
        // yarn add -D sass-loader node-sass style-loader css-loader
        {
          test: /\.(scss|css)$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },

        //   // html ---------------------------------------------
        //   {
        //     test: /\.html$/,
        //     use: [
        //       {
        //         loader: "html-loader",
        //         options: { minimize: true }, //코드 용량을 최소화 할 것인가?
        //       },
        //     ],
        //   },

        // files(image files) ---------------------------------------------
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]?[hash]",
                // publicPath: `../dist`,
              },
            },
          ],
        },
      ],
    },

    //------------------------------------------------------------
    // plugins: utils for more convenience.
    plugins: [
      new webpack.DefinePlugin({
        "process.env.VERSION": JSON.stringify(version),
        "process.env.APPNAME": JSON.stringify(appname),
      }),
    ],

    //--------------------------------------------------------------
    // remove comments, not license.
    optimization: {
      minimize: true,
      splitChunks: {},
      concatenateModules: true,
    },
  };

  return config;
};
