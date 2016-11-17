import config from 'config';

import _ from 'lodash';
import bunyan from 'bunyan';
import fs from 'fs';
import streamWrapper from 'logging/stream-wrapper';

import ExpressBunyanLogger from 'express-bunyan-logger';
import RotatingStream from 'logrotate-stream';

const excludedConsoleKeys = [
  'req-headers', 'user-agent', 'referer', 'tags',
];

// Create Bunyan Logger
const loggerOptions = {
  name: 'boothby',
};
if (config.logging && config.logging.file) {
  let logStream;
  if (!config.logging.rotate) {
    logStream = fs.createWriteStream(config.logging.file, {flags: 'a', encoding: 'utf8'});
  } else {
    logStream = new RotatingStream({
      file: config.logging.file,
      size: config.logging.rotate.maxSize,
      keep: config.logging.rotate.maxFiles,
      compress: true,
    });
  }
  loggerOptions.streams = [{
    level: config.logging.level || 'warn',
    type: 'raw',
    stream: streamWrapper.builder(logStream)
      .exclude(excludedConsoleKeys)
      .stringify()
      .build(),
  }];
} else {
  loggerOptions.streams = [{
    level: config.logging.level || 'warn',
    type: 'raw',
    stream: streamWrapper.builder(process.stdout)
      .exclude(excludedConsoleKeys)
      .stringify()
      .build(),
  }];
}

export const logger = bunyan.createLogger(loggerOptions);

// Create Express logger
const requestLevelConfig = config.logging.requestLevels;
const expressLoggerOptions = _.defaultsDeep({
  format: ':incoming :method :url HTTP/:http-version :status-code',
  levelFn(status, err) {
    if (err || status >= 500) { // server internal error or error
      return requestLevelConfig.error || 'debug';
    } else if (status >= 400) { // client error
      return requestLevelConfig.notFound || 'debug';
    }
    return requestLevelConfig.success || 'trace';
  },
  excludes: [
    'req', 'res', 'body',
    'response-hrtime',
    'headers', 'res-headers',
  ],
  parseUA: false,
  serializers: {
    req: (req) => _.merge(bunyan.stdSerializers.req(req), {
      tags: ['client-request'],
    }),
    res: (res) => _.merge(bunyan.stdSerializers.res(res), {
      tags: ['client-response'],
    }),
    err: bunyan.stdSerializers.req,
  },
  logger,
}, loggerOptions);

export const expressLogger = ExpressBunyanLogger(expressLoggerOptions);
export const expressErrorLog = ExpressBunyanLogger.errorLogger(expressLoggerOptions);

export default {
  logger,
  expressLogger,
  expressErrorLog,
};
