import _ from 'lodash';
import config from 'config';
import fs from 'fs';
import webpack from 'webpack';
import BowerWebpackPlugin from 'bower-webpack-plugin';

import {isNodeEnv} from './gulp.d/util';

const babelrc = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'));

let webpackConfig = {
  entry: 'app.js',
  output: {
    path: 'dist/server/public',
    filename: 'bundle.js',
  },
  devServer: {
    headers: { 'Access-Control-Expose-Headers': 'SourceMap,X-SourceMap' },
    historyApiFallback: true,
    // hot: true,
    inline: true,
    port: 3002,
    noInfo: false,
    stats: {
      colors: true,
      chunks: false,
    },
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json',
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
          presets: babelrc.presets || [],
          plugins: babelrc.plugins || [],
        },
        exclude: /(node_modules)/,
      },
    ],
    plugins: [
      new BowerWebpackPlugin(),
    ],
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'ENABLE_SOURCEMAP_SUPPORT': JSON.stringify(config.debug.browserSourceMapSupport),
    }),
  ],
  resolve: {
    modulesDirectories: [
      'node_modules',
      'app',
      'shared',
    ],
    extensions: [
      '',
      '.webpack.js',
      '.json',
      '.js',
      '.hbs',
    ],
    alias: {
    },
  },
  resolveLoader: {
    alias: {
    },
  },
  node: {
    fs: 'empty',
  },
};

if (!isNodeEnv('staging', 'production')) {
  webpackConfig = _.merge(webpackConfig, {
    devtool: 'source-map',
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'source-map-loader',
      },
    ],
  });
}

if (isNodeEnv('staging', 'production')) {
  webpackConfig.plugins = _(webpackConfig.plugins).concat([
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compressor: {
        warnings: false,
      },
    }),
    new webpack.optimize.DedupePlugin(),
  ]).value();
}

export default webpackConfig;
