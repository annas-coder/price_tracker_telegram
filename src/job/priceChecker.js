// import cron from 'node-cron';
import { readSubscribers, saveSubscribers } from '../services/userService.js';
import { getProductPrice } from '../services/scraper.js';
import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_TOKEN } from '../config/index.js';
// import { TELEGRAM_BOT_TOKEN } from '../config/env.js';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

export const startPriceCheckJob = async() => {
    const data = readSubscribers();
    if (!data) return console.error('No subscribers found.');

    const { subscribers } = data;
    // let subscribersChanged = false;

    for (const subscriber of subscribers) {
      console.log(subscriber,'testing')
      for (const product of subscriber.productList) {
        const [latest] = await getProductPrice(product.url);

        if (!latest || !latest.price) continue;

        const oldPrice = Number(product.price.replace(/[^0-9.-]+/g,""));
        const newPrice = Number(latest.price.replace(/[^0-9.-]+/g,""));

        if (newPrice < oldPrice) {
          const message = 
            `💸 *Price Drop Alert!*\n\n` +
            `*${latest.name}*\n` +
            `Old Price: ₹${product.price}\n` +
            `New Price: ₹${latest.price}\n\n` +
            `[View Product](${product.url})`; 

          await bot.sendMessage(subscriber.id, message, { parse_mode: 'Markdown' });
          product.price = latest.price;
          // subscribersChanged = true;
        }
      }
    }

    // if (subscribersChanged) {
      saveSubscribers(subscribers);
    // }

};
