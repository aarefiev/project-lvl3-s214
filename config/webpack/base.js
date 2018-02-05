import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const extractSass = new ExtractTextPlugin({ filename: 'styles.css' });

export default () => ({
  entry: './src/index.js',
  output: {
    library: 'RSSReader',
    path: path.join(__dirname, '../../dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
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
            ],
          },
        },
      },
      {
        test: /\.pug$/,
        exclude: /node_modules/,
        use: {
          loader: 'pug-loader'
        },
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [
            { loader: 'css-loader' },
            { loader: 'sass-loader' }
          ]
        }),
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'RSSReader',
      template: path.join(__dirname, '../../src/index.pug'),
    }),
    extractSass
  ],
});
