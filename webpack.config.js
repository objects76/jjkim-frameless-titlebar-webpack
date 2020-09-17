// https://webpack.js.org/concepts/

// webpack cli in package.json(react-hot-loader is needed?)
//  "webpack-dev-server --hot"
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const { name: appname, version } = require("./package.json");

// const
const OUTPUT = "dist";

module.exports = {
  mode: "development",
  devtool: "eval", // or hidden-source-map
  resolve: {
    extensions: [".jsx", ".js", ".ts", ".tsx", ".json"],
  },

  externals: {
    electron: "electron",
  },

  //------------------------------------------------------------
  // Entry
  entry: {
    main: "./src/index.js",
    // elec: "./src/elec/main.js",
  },
  //------------------------------------------------------------
  // Outputs
  output: {
    path: path.resolve(__dirname, OUTPUT),
    filename: "[name].js",
    // publicPath: "/" + OUTPUT,
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
                debug: true,
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
    new CleanWebpackPlugin(),
    // new webpack.LoaderOptionsPlugin({ debug: true }), // apply to all loader.
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      favicon: "./public/favicon.ico",
      manifest: "./public/manifest.json",
    }),
    new CopyPlugin({
      patterns: [
        { from: "./public/manifest.json" },
        { from: "./package.json" },
      ],
      //patterns: [{ from: "./public/static", to: "static" }],
    }),
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
  // webpack-dev-server config.
  devServer: {
    contentBase: __dirname + `/${OUTPUT}/`,
    inline: true,
    hot: true,
    host: "localhost",
    port: 5500,
  },

  //--------------------------------------------------------------
  // remove comments not license one.
  optimization: {
    minimize: true,
    splitChunks: {},
    concatenateModules: true,
  },
};
