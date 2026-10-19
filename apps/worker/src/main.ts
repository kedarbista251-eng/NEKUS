import { runWorker } from './worker.js';

runWorker().catch((err) => {
  console.error('[NEXUS WORKER FATAL]', err);
  process.exit(1);
});
