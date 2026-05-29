import { Worker, Job } from 'bullmq';
import { connection } from '../queues/connection';
import { notificationQueueName as queueName } from '../queues/notification.queue';

export const startNotificationWorker = () => {
  const worker = new Worker(
    queueName,
    async (job: Job) => {
      if (job.name === 'debt-warning-email') {
        const { agencyId, agencyName, currentDebt, creditLimit, email } = job.data;
        
        // In a real app, integrate Nodemailer or SendGrid here
        console.log(`\n[WORKER] 📧 SENDING URGENT DEBT WARNING EMAIL`);
        console.log(`To: ${email}`);
        console.log(`Subject: ⚠️ Cảnh báo hạn mức công nợ - Đại lý ${agencyName}`);
        console.log(`Body: Đại lý ${agencyName} đã đạt dư nợ ${currentDebt} / ${creditLimit} (vượt 80% hạn mức). Vui lòng thanh toán sớm để không bị gián đoạn đơn hàng.\n`);
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`[WORKER] ✅ Email sent successfully to ${agencyName}`);
      }
    },
    { connection: connection as any }
  );

  worker.on('failed', (job, err) => {
    console.error(`[WORKER] ❌ Job ${job?.id} failed with error:`, err.message);
  });

  console.log('🚀 BullMQ Notification Worker started');
  return worker;
};
