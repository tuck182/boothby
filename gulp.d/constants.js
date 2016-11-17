import {join as P} from 'path';

export const PROJECT_ROOT = global.GULP_ROOT;
export const DIST_ROOT = P(PROJECT_ROOT, 'dist');
export const NPM_MANIFEST = require(P(PROJECT_ROOT, 'package.json'));

// Shared paths
export const SHARED_SOURCE_ROOT = P(PROJECT_ROOT, 'shared');
export const PUBLIC_SOURCE_ROOT = P(PROJECT_ROOT, 'public');

// Client paths
export const CLIENT_SOURCE_ROOT = P(PROJECT_ROOT, 'app');

// Server paths
export const SERVER_SOURCE_ROOT = P(PROJECT_ROOT, 'server');
export const DIST_SERVER = P(DIST_ROOT, 'server');

// Test paths
export const TEST_ROOT = P(PROJECT_ROOT, 'test');
