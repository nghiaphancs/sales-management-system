import { Queue } from 'bullmq';
import { connection } from './connection';

export const notificationQueueName = 'notification-queue';

export const notificationQueue = new Queue(notificationQueueName, {
  connection: connection as any,
});

export const addDebtWarningEmailJob = async (data: { agencyId: string; agencyName: string; currentDebt: number; creditLimit: number; email: string }) => {
  await notificationQueue.add('debt-warning-email', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  });
};
