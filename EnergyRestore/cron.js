import cron from 'node-cron';
import { executeDailyTask } from './dailyTask.js';

// Запуск каждый день в 3:00 (с указанием временной зоны) 
cron.schedule('*/3 * * * *', async () => {
  console.log('🚀 Запуск ежедневной задачи...', new Date().toISOString());
  
  try {
    await executeDailyTask();
    console.log('✅ Задача успешно выполнена');
  } catch (error) {
    console.error('❌ Ошибка выполнения задачи:', error);
  }
}, {
  scheduled: true,
  timezone: "Europe/Moscow"
});

console.log('⏰ Планировщик задач инициализирован');