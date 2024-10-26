// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const webpack = require("webpack");
const dotenv = require("dotenv");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const env = dotenv.config().parsed;
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const isAnalyze = process.env.ANALYZE === 'true';

  return {
    entry: "./src/index.tsx",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "bundle.[contenthash].js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      alias: {
        "@app": path.resolve(__dirname, "src"),
        "@app/api": path.resolve(__dirname, "src/api"),
        "@app/assets": path.resolve(__dirname, "src/assets"),
        "@app/components": path.resolve(__dirname, "src/components"),
        "@app/fonts": path.resolve(__dirname, "src/fonts"),
        "@app/types": path.resolve(__dirname, "src/types"),
        "@app/hooks": path.resolve(__dirname, "src/hooks"),
        "@app/utils": path.resolve(__dirname, "src/utils"),
        "@app/react-router": path.resolve(__dirname, "src/react-router"),
        "@app/styles": path.resolve(__dirname, "src/styles"),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: "babel-loader",
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader", 'postcss-loader'
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin(envKeys), // environment variables
      new HtmlWebpackPlugin({
        template: "./public/index.html",
      }),
      isProduction && isAnalyze && 
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: "bundle-report.html",
        }),
      isProduction &&
        new MiniCssExtractPlugin({
          filename: "[name].[contenthash].css",
        }),
    ].filter(Boolean),
    devServer: {
      static: {
        directory: path.join(__dirname, "public"),
      },
      compress: true,
      port: 3000,
      hot: true,
      historyApiFallback: true,
    },
  };
};
