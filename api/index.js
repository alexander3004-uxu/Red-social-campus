/**
 * api/index.js
 * Vercel Serverless Function entry point.
 * Re-exports the Express app to handle /api/* requests on Vercel.
 */

import app from '../server/app.js';

export default app;
