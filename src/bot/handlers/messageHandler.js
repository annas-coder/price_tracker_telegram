// import { Bot } from 'node-telegram-bot-api';
import { readSubscribers, saveSubscribers } from '../../services/userService.js';
import { getProductPrice } from '../../services/scraper.js';

export const handleMessage = async (bot, msg) => {
  const { chat: { id, first_name }, text } = msg;

  if (text.startsWith('/')) return;

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  if (!urlRegex.test(text)) {
    return bot.sendMessage(id, '❌ Please send a valid product URL.');
  }

  const { subscribers } = await readSubscribers();
  const userIndex = subscribers.findIndex(user => user.id === id);

  if (userIndex === -1) {
    return bot.sendMessage(id, '⚠️ You are not subscribed yet. Send /start first!');
  }

  bot.sendMessage(id, '⏳ Scraping product details, please wait...');
  const productDetail = await getProductPrice(text);
  
  const checkIsProductExisting = subscribers[userIndex].productList.some((productItem)=>productItem.name === productDetail[0].name)

  if(checkIsProductExisting){
    return bot.sendMessage(id, 'This product is already in your tracking list');
  }

  if (!productDetail || !productDetail[0].price) {
    return bot.sendMessage(id, '❌ Could not retrieve product details.');
  }

  subscribers[userIndex].productList.push({
    id: subscribers[userIndex].productList.length + 1,
    url: text,
    ...productDetail[0],
  });

  await saveSubscribers(subscribers);
  bot.sendMessage(id, `✅ Product *${productDetail[0].name}* saved!`, { parse_mode: "Markdown" });
};
