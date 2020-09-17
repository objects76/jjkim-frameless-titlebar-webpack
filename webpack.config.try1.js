// https://webpack.js.org/concepts/

// webpack cli in package.json(react-hot-loader is needed?)
//  "webpack-dev-server --hot"
const path = require("path");
const webpack = require("webpack");
const { name: appname, version } = require("./package.json");

module.exports = (env, options) => {
  if (!options.mode) options.mode = "development";
  console.log(
    `---------------------- ${options.mode} ---------------------------`
  );

  const config = {
    mode: options.mode,
    devtool: "eval", // or hidden-source-map
    resolve: {
      extensions: [".jsx", ".js", ".ts", ".tsx", ".json"],
    },

    externals: {
      electron: "electron",
    },

    // target: "electron-main",

    //------------------------------------------------------------
    // Entry
    entry: {
      main: "./src/index.js",
      // elec: "./src/elec/main.js",
    },
    //------------------------------------------------------------
    // Outputs
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[chunkhash].js",
      chunkFilename: "[id].[chunkhash].js",
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
                // publicPath: `../${OUTPUT}`,
              },
            },
          ],
        },
      ],
    },

    //------------------------------------------------------------
    // plugins: utils for more convenience.
    plugins: [
      // set version from package.
      new webpack.DefinePlugin({
        "process.env.VERSION": JSON.stringify(version),
        "process.env.APPNAME": JSON.stringify(appname),
      }),
    ],

    //-------------------------------------------------------------
    // abs include path:
    //  - https://engineering.huiseoul.com/리액트-상대경로-절대경로-변경-1485babb5198
    resolve: {
      modules: [
        path.join(__dirname, "src"),
        path.join(__dirname, "elec"),
        "node_modules",
      ],
    },

    //-------------------------------------------------------------
    // optimization
    optimization: {
      // nodeEnv: "electron",
      minimize: true,
      concatenateModules: true,
      // https://webpack.js.org/plugins/split-chunks-plugin/#select-chunks
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    },
  };

  if (options.mode === "development") {
    //-------------------------------------------------------------
    // webpack-dev-server config.
    config.devServer = {
      contentBase: `${__dirname}/dist/`,
      inline: true,
      hot: true,
      host: "localhost",
      port: 5500,
    };
    // config.plugins = [ ...config.plugins, new webpack.LoaderOptionsPlugin({ debug: true })]; // apply to all loader.

    config.output = {
      ...config.output,
      filename: "[name].[hash].js",
      chunkFilename: "[id].[hash].js",
      // publicPath: "/dist",
    };
  } else {
    //-------------------------------------------------------------
    //... Production 설정
    const { CleanWebpackPlugin } = require("clean-webpack-plugin");
    const HtmlWebpackPlugin = require("html-webpack-plugin");
    const CopyPlugin = require("copy-webpack-plugin");

    config.plugins = [
      ...config.plugins,
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        // favicon: "./public/favicon.ico",
        // manifest: "./public/manifest.json",
      }),
      new CopyPlugin({
        patterns: [{ from: "./public/manifest.json" }],
        //patterns: [{ from: "./public/static", to: "static" }],
      }),
    ];

    // //--------------------------------------------------------------
    // // remove comments not license one.
    // optimization: {
    //   minimize: true,
    //   splitChunks: {},
    //   concatenateModules: true,
    // },
  }

  return config;
};
