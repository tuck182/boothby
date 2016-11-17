#!/usr/bin/env node

import 'install-source-map-support';

/**
 * Server: single process.
 */
import config from 'config';
import app from 'app';

app.listen(config.express.port, config.express.address, () => {
  app.log.info(`Server started on port ${config.express.port}`);
});
