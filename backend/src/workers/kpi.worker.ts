import { Worker, Job } from 'bullmq';
import { connection } from '../queues/connection';
import { kpiQueueName } from '../queues/kpi.queue';
import { prisma } from '../prisma';

export const startKpiWorker = () => {
  const worker = new Worker(
    kpiQueueName,
    async (job: Job) => {
      if (job.name === 'calculate-commission') {
        const { month, year } = job.data;
        console.log(`\n[KPI WORKER] 🧮 Bắt đầu tính toán Hoa hồng & KPI tháng ${month}/${year}`);

        // 1. Lấy tất cả user (Sales)
        const salesUsers = await prisma.user.findMany({
          where: { role: 'SALES', isActive: true },
        });

        for (const sales of salesUsers) {
          // Lấy KpiTarget
          const kpi = await prisma.kpiTarget.findUnique({
            where: {
              salesId_month_year: { salesId: sales.id, month, year }
            }
          });

          // Lấy tổng doanh thu các đơn hàng ĐÃ THANH TOÁN HOÀN TOÀN (chỉ là ví dụ)
          // Hoặc đơn giản là tổng các đơn hàng đã giao
          const orders = await prisma.order.findMany({
            where: {
              salesId: sales.id,
              status: 'DELIVERED',
              createdAt: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1)
              }
            }
          });

          let actualRevenue = 0;
          orders.forEach(o => actualRevenue += Number(o.totalAmount));

          let commissionAmount = 0;
          let commissionRate = 0;

          if (kpi) {
            const target = Number(kpi.targetRevenue);
            if (actualRevenue >= target) {
              commissionRate = 0.05; // 5% nếu đạt KPI
            } else if (actualRevenue >= target * 0.8) {
              commissionRate = 0.02; // 2% nếu đạt 80% KPI
            }
          } else {
            // Không có KPI target, mặc định 1%
            commissionRate = 0.01;
          }

          commissionAmount = actualRevenue * commissionRate;

          // Cập nhật hoặc tạo Commission record
          await prisma.commission.upsert({
            where: {
              salesId_month_year: { salesId: sales.id, month, year }
            },
            update: {
              calculatedAmount: commissionAmount,
              updatedAt: new Date()
            },
            create: {
              salesId: sales.id,
              month,
              year,
              calculatedAmount: commissionAmount,
            }
          });

          console.log(`[KPI WORKER] 👤 Sales ${sales.name}: Doanh thu = ${actualRevenue.toLocaleString()} VND | Hoa hồng = ${commissionAmount.toLocaleString()} VND`);
        }
        
        console.log(`[KPI WORKER] ✅ Đã hoàn tất tính toán cho ${salesUsers.length} nhân viên.`);
      }
    },
    { connection: connection as any }
  );

  worker.on('failed', (job, err) => {
    console.error(`[KPI WORKER] ❌ Job ${job?.id} failed:`, err.message);
  });

  console.log('🚀 BullMQ KPI Worker started');
  return worker;
};
