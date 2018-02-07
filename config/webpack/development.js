const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const baseConfig = require('./base.js');

module.exports = webpackMerge(baseConfig, {
  devtool: '#cheap-module-eval-source-map',
  devServer: {
    hot: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
});
