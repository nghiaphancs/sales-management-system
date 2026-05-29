import { Queue } from 'bullmq';
import { connection } from './connection';

export const kpiQueueName = 'kpi-calculation-queue';

export const kpiQueue = new Queue(kpiQueueName, { connection: connection as any });

export const addKpiCalculationJob = async (data: { month: number; year: number }) => {
  await kpiQueue.add('calculate-commission', data, {
    attempts: 2,
    removeOnComplete: true,
  });
};
