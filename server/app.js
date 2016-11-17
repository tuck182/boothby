import express from 'express';
import logging from 'logging';

const app = express();
app.log = logging.logger;
app.use(logging.expressLogger);

// We point to our static assets
app.use(express.static('public'));

export default app;
