import { config } from 'dotenv';
config();
import { createApp } from './app';
import { startNotificationWorker } from './workers/notification.worker';
import { startKpiWorker } from './workers/kpi.worker';

const PORT = Number(process.env.PORT) || 4000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Backend API running at http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  startNotificationWorker();
  startKpiWorker();
});
