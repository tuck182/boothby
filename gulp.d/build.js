import gulp from 'gulp';
import babel from 'gulp-babel';
import less from 'gulp-less';
import gulpif from 'gulp-if';
import newer from 'gulp-newer';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';

import _ from 'lodash';
import del from 'del';
import es from 'event-stream';
import fs from 'fs';
import {join as P} from 'path';
import webpackStream from 'webpack-stream';

import {
  PROJECT_ROOT,
  DIST_ROOT,

  SHARED_SOURCE_ROOT,
  PUBLIC_SOURCE_ROOT,
  CLIENT_SOURCE_ROOT,
  SERVER_SOURCE_ROOT,

  DIST_SERVER,
} from './constants';

const babelConfig = JSON.parse(fs.readFileSync(P(__dirname, '../.babelrc')));

// Root tasks
gulp.task('clean', ['clean:dist']);
gulp.task('build', ['build:server', 'build:client']);

// Clean
gulp.task('clean:dist', function() {
  return del([
    `${DIST_ROOT}/**`,
  ]);
});

// Build client
gulp.task('build:client', ['build:client:scripts']);
gulp.task('build:client:scripts', () => buildClient());
export function buildClient({dest = DIST_SERVER, opts = {}, watch = false} = {}) {
  return webpackTask(
    CLIENT_SOURCE_ROOT,
    P(dest, 'public'),
    P(PROJECT_ROOT, 'webpack.config.babel.js'),
    {opts, watch});
}

// Build server
gulp.task('build:server', [
  'build:server:scripts',
  'build:server:static',
]);
gulp.task('build:server:scripts', () => buildServerScripts());
gulp.task('build:server:static', () => buildServerStatic());

function buildServerScripts(dest = DIST_SERVER) {
  return es.concat(
    _([SHARED_SOURCE_ROOT, SERVER_SOURCE_ROOT]).map((src) =>
      buildJavascript(src, dest)
    ).value());
}
function buildServerStatic(dest = DIST_SERVER) {
  return es.concat(
    // Copy swfobject assets
    gulp.src(P(PUBLIC_SOURCE_ROOT, '**'))
      .pipe(gulp.dest(P(dest, 'public'))),
  );
}



//
// Helper functions
//
function buildStyles(dest) {
  return gulp.src(_(['main', 'flags'])
      .map((f) => P(PUBLIC_SOURCE_ROOT, 'styles', `**/${f}.less`))
      .value())
    .pipe(newer(P(dest, 'styles')))
    .pipe(less())
    // .pipe(cleanCss({keepBreaks: true}))
    .pipe(gulp.dest(P(dest, 'styles')));
}

function buildJavascript(sources, dest, babelPlugins = []) {
  if (!_.isArray(sources)) {
    sources = [sources];
  }
  return es.concat(_.map(sources, (src) => {
    return gulp.src(P(src, '**/*.js'))
      .pipe(newer(dest))
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: babelConfig.presets,
        plugins: babelPlugins,
      }))
      .pipe(sourcemaps.write('.', {
        sourceRoot(_file) {
          return src;
        },
        includeContent: false,
      }))
      .pipe(plumber.stop())
      .pipe(gulp.dest(dest));
  }));
}

function webpackTask(srcRoot, destRoot, config, {opts = {}, watch = false} = {}) {
  const webpackOpts =  _.merge({}, require(config).default, opts, {
    watch,
    output: {
      path: destRoot,
    },
  });

  return gulp.src(webpackSources(srcRoot, webpackOpts.entry))
    .pipe(gulpif(!watch, newer(P(destRoot, webpackOpts.output.filename))))
    .pipe(webpackStream(webpackOpts))
    .pipe(gulp.dest(destRoot));
}

function webpackSources(srcRoot, entry) {
  if (_.isArray(entry)) {
    return _(entry).map((e) => webpackSources(srcRoot, e)).flatten().value();
  }
  if (_.isObject(entry)) {
    return webpackSources(srcRoot, _.values(entry));
  }
  return P(srcRoot, entry);
}
