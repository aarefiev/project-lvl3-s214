const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSass = new ExtractTextPlugin({ filename: 'styles.css' });

module.exports = {
  entry: ['babel-polyfill', './src/index.js'],
  output: {
    library: 'app',
    path: path.join(__dirname, '../../dist'),
    filename: 'application.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                'flow',
                ['env', {
                  modules: false,
                  targets: {
                    browsers: '> 0%',
                    uglify: true,
                  },
                  useBuiltIns: true,
                }],
              ],
              plugins: [
                'syntax-dynamic-import',
                'transform-class-properties',
              ],
            },
          },
        ],
      },
      {
        test: /\.pug$/,
        exclude: /node_modules/,
        use: {
          loader: 'pug-loader',
        },
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [
            { loader: 'css-loader' },
            { loader: 'sass-loader' },
          ],
        }),
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new HtmlWebpackPlugin({
      title: 'RSSReader',
      favicon: path.join(__dirname, '../../src/assets/favicon.ico'),
      template: path.join(__dirname, '../../src/index.pug'),
      inject: 'head',
    }),
    extractSass,
  ],
  devServer: {
    hot: false,
  },
};
