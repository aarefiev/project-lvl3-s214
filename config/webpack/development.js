import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import getBaseConfig from './base';

export default () => webpackMerge(getBaseConfig(), {
  devtool: '#cheap-module-eval-source-map',
  devServer: {
    hot: true,
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
