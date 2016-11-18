import gulp from 'gulp';
import eslint from 'gulp-eslint';

import {join as P} from 'path';

import {
  PROJECT_ROOT,
  SHARED_SOURCE_ROOT,
  CLIENT_SOURCE_ROOT,
  SERVER_SOURCE_ROOT,
} from './constants';

// Lint
gulp.task('lint', () => {
  if (process.env.SKIP_LINT) {
    return;
  }
  return gulp.src([
    P(CLIENT_SOURCE_ROOT, '**/*.js'),
    P(SERVER_SOURCE_ROOT, '**/*.js'),
    P(SHARED_SOURCE_ROOT, '**/*.js'),
  ])
    .pipe(eslint({
      ignorePath: P(PROJECT_ROOT, '.eslintignore'),
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
