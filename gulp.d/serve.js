import gulp from 'gulp';
import gutil from 'gulp-util';
import nodemon from 'gulp-nodemon';

import _ from 'lodash';
import config from 'config';
import path, {join as P} from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import webpackConfig from '../webpack.config.babel';

import * as build from './build';
import * as taskUtil from './util';
import {
  PUBLIC_SOURCE_ROOT,
  SHARED_SOURCE_ROOT,
  SERVER_SOURCE_ROOT,
  CLIENT_SOURCE_ROOT,
  DIST_SERVER,
} from './constants';

gulp.task('watch', ['watch:client', 'watch:server']);
gulp.task('serve', ['serve:express', 'serve:webpack-dev-server']);

gulp.task('watch:client', build.clientScriptsDeps, function () {
  gulp.watch(P(CLIENT_SOURCE_ROOT, '**/*.less'), ['build:client:css']);
  return build.buildClient({watch: true})();
});

gulp.task('watch:server', ['build:server'], function () {
  gulp.watch('gulpfile.babel.js', ['build:server']);
  gulp.watch(P(SHARED_SOURCE_ROOT, '**/*.js'), ['build:server:scripts']);
  gulp.watch(P(SERVER_SOURCE_ROOT, '**/*.js'), ['build:server:scripts']);
});

// Start an express server
gulp.task('serve:express', ['build:server'], function() {
  taskUtil.requireNodePath([DIST_SERVER]);
  process.env.NODE_CONFIG_DIR = P(DIST_SERVER, 'config');

  const nodemonArgs = _.merge({
    nodeArgs: taskUtil.flagsAsList(),
    script: P(DIST_SERVER, 'server.js'),
    watch: [
      'gulpfile.babel.js',
      PUBLIC_SOURCE_ROOT,
      SHARED_SOURCE_ROOT,
      SERVER_SOURCE_ROOT,
    ],
    ext: '*',
    tasks(changedFiles) {
      const tasks = {};
      (changedFiles || []).forEach(function (file) {
        if (file.startsWith(PUBLIC_SOURCE_ROOT)) tasks['build:server:static'] = true;
        if (path.extname(file) === '.js') tasks['build:server:scripts'] = true;
      });
      return _.keys(tasks);
    },
    stdout: false, // allows piping to bunyan
  }, process.env.NODE_DEBUG ? {
    exec: 'node-inspector & node --debug-brk',
  } : {});

  taskUtil.bunyanNodemon(nodemon(nodemonArgs));
});

// Start a webpack dev server
gulp.task('serve:webpack-dev-server', build.clientScriptsDeps, function() {
  // modify some webpack config options
  const conf = _.defaultsDeep({
    debug: true,
    devServer: {
      contentBase: `${webpackConfig.output.path}/`,
      publicPath: `/${webpackConfig.output.publicPath || ''}`,
      proxy: {
        '**': {
          target: `http://localhost:${config.express.port}`,
        },
      },
      stats: {
        colors: true,
        chunks: false,
      },
    },
    plugins: _(webpackConfig.plugins).concat([
      new webpack.HotModuleReplacementPlugin(),
    ]).value(),
    // devtool: 'eval-source-map',
    output: {
      path: P(DIST_SERVER, 'public'),
    },
  }, webpackConfig);

  // Start a webpack-dev-server
  new WebpackDevServer(webpack(conf), conf.devServer)
    .listen(conf.devServer.port, '0.0.0.0', function(err) {
      if (err) throw new gutil.PluginError('webpack-dev-server', err);
      gutil.log('[webpack-dev-server]',
        `http://localhost:${conf.devServer.port}/webpack-dev-server/`);
    });
  // open('http://localhost:' + conf.devServer.port + '/webpack-dev-server/');
});
