import { createLogger } from '@nexus/observability';
import { loadConfig } from '@nexus/config';

export async function sampleHealthActivity(): Promise<{ status: string; timestamp: string }> {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
  };
}

export async function runWorker() {
  const config = loadConfig();
  const logger = createLogger('nexus-worker');

  logger.info(`NEXUS Temporal Worker configured for queue: ${config.TEMPORAL_TASK_QUEUE}`);
  logger.info(`Target Temporal Server: ${config.TEMPORAL_ADDRESS}`);

  return {
    initialized: true,
    taskQueue: config.TEMPORAL_TASK_QUEUE,
  };
}
