const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
    popup: path.join(srcDir, "entry/popup.tsx"),
    options: path.join(srcDir, "entry/options.tsx"),
    background: path.join(srcDir, "entry/background.ts"),
    content_script: path.join(srcDir, "entry/content_script.tsx"),
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    filename: "[name].js",
    publicPath: "/public/",
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks(chunk) {
        return chunk.name !== "background";
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.svg$/,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        { from: ".", to: "../", context: "public" },
        { from: "src/assets", to: "../assets" },
      ],
      options: {},
    }),
  ],
};
