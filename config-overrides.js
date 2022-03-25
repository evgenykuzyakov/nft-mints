const webpack = require("webpack");
module.exports = function override(config) {
  config.resolve.fallback = {
    fs: false,
    crypto: false,
    stream: false,
  };
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);
  return config;
};
