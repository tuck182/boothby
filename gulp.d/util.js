import gutil from 'gulp-util';

import _ from 'lodash';
import {exec, spawn} from 'child_process';
import fsLib from 'fs';
import kexec from 'kexec';
import mktemp from 'mktemp';
import module from 'module';
import Promise from 'bluebird';
import setflags from 'setflags';

const fs = Promise.promisifyAll(fsLib);

export function isNodeEnv(...envs) {
  return _.includes(envs, process.env.NODE_ENV);
}

// Given a nodemon process, creates a bunyan process and pipes all output
// through it.
export function bunyanNodemon(nodemon) {
  let bunyan;
  nodemon.on('readable', () => {
    bunyan && bunyan.kill();
    bunyan = bunyanProc();
    nodemon.stdout.pipe(bunyan.stdin);
    nodemon.stderr.pipe(bunyan.stdin);
  });
  return nodemon;
}

// Creates a bunyan process with stdin that can be passed to another module
export function bunyanProc() {
  return spawn(
    'bunyan', ['-o', 'short'],
    { stdio: ['pipe', process.stdout, process.stderr] }
  );
}

export function flagsAsList(flags = setflags.flags) {
  return _(flags)
  .map((v, k) => {
    return typeof(v) !== 'undefined' ? `${k}=${v}` : k;
  })
  .value();
}

export function requireFlags(flags) {
  if (!_.isArray(flags)) flags = [flags];

  const newFlags = {};
  _(flags)
  .map((flag) => flag.split('='))
  .each(([key, value]) => {
    if (!(key in setflags.flags)
      || (typeof(value) !== 'undefined' && setflags.flags[key] !== value)) {
      newFlags[key] = value;
    }
  });

  if (!_.isEmpty(newFlags)) {
    gutil.log(gutil.colors.bold.green(
      `Restarting gulp to enable ${flagsAsList(newFlags).join(' ')}`));
    const argv = _.clone(process.argv);
    argv.splice(1, 0, flagsAsList(newFlags));
    const [cmd, ...args] = argv;
    kexec(cmd, args);
  }
}

export function constructNodePath(paths, includeCurrent = true) {
  if (!_.isArray(paths)) paths = [paths];
  const currentPaths = (includeCurrent && process.env.NODE_PATH)
    ? process.env.NODE_PATH.split(':')
    : [];
  return _.flatten([paths, currentPaths]).join(':');
}

export function requireNodePath(paths) {
  const newPath = constructNodePath(paths);
  if (!_.isEqual(process.env.NODE_PATH, newPath)) {
    // Just setting this doesn't work because it's scanned at startup and then ignored.
    // So we have to set it, then call a private method in module to reinitialize
    // paths. All to avoid having to use relative paths all over the place in code.
    process.env.NODE_PATH = newPath;
    module._initPaths();
  }
}

export function withTempFile(template, fn) {
  return Promise.using(Promise.resolve(mktemp.createFile(template))
    .disposer(function (filename) {
      return fs.unlinkAsync(filename);
    }
  ), function (filename) {
    return fn(filename);
  });
}

export function execAsync(command, options) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(new Error(`Command failed with status [${error}]: ${command}\n`
          + (stderr ? `stderr:\n${stderr}\n` : '')));
      }
      gutil.log(gutil.colors.green(`execute ${command}:`));
      _.each(stdout.trim().split('\n'), (line) => {
        gutil.log(`stdout: ${line}`);
      });
      resolve();
    });
  });
}
