import { scrap, load } from './haapi';
import { send } from './discord';
import cron from 'node-cron';

console.info('Dragoturkey is starting ...');
await load();
console.info('Loaded known items.');
Bun.env.TZ = 'Europe/Paris';

// /!\ Feel free to edit the cron expressions but keep in mind that Ankama's API is rate limited, check COUNT in haapi.ts
cron.schedule('* 6-21 * * 1-5', async () => {
  // Every minute between 6am and 9pm on weekdays
  await run();
});
cron.schedule('*/5 1,2,3,4,5,22,23 * * 1-5', async () => {
  // Every 5 minutes between 1am and 5am and between 10pm and 11pm on weekdays
  await run();
});
cron.schedule('*/5 * * * 6,7', async () => {
  // Every 5 minutes on weekends
  await run();
});
console.info('Tasks scheduled.');

async function run() {
  const items = await scrap();
  items.forEach(async (item: any) => {
    console.info(`[${item.template_key}][${item.sites}] ${item.name} (${item.id})`);
    await send(item);
  });
  if (items.length === 0 && Bun.env.DEBUG) {
    console.debug(`No new items.`);
  }
}