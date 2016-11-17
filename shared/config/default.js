/* eslint-disable import/no-commonjs */
/**
 * Default configuration.
 *
 * This file is the base for all configurations and deep-merged in with
 * overriding other configurations.
 */

module.exports = {
  debug: {
    browserSourceMapSupport: false,
  },
  express: {
    address: process.env.ADDRESS || '0.0.0.0',
    port: process.env.PORT || 80,
  },
  logging: {
    level: 'info',
    requestLevels: {
      error: 'warn',
      notFound: 'warn',
      success: 'debug',
    },
  },
};
