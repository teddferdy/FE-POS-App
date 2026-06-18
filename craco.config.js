/* eslint-env node */
const path = require("path");
const webpack = require("webpack");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src")
    },
    configure: (webpackConfig) => {
      if (webpackConfig.optimization?.splitChunks?.cacheGroups) {
        webpackConfig.optimization.splitChunks.cacheGroups = {
          ...webpackConfig.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all",
            priority: 10,
            enforce: true
          }
        };
      }
      return webpackConfig;
    }
  }
};
