import { readSubscribers, saveSubscribers } from '../../services/userService.js';

export const handleStartCommand = async (bot, msg) => {
 const { chat: { id, first_name, last_name } } = msg;

  const data = readSubscribers();
  if (!data) return bot.sendMessage(id, "⚠️ Failed to read subscriber data.");

  const { subscribers } = data;

  const existingUser = subscribers.find(sub => sub.id === id);

  if (existingUser) {
    bot.sendMessage(id, `👋 Hi ${first_name || 'there'}! You are already subscribed.`);
    return;
  }

  subscribers.push({
    id,
    first_name,
    last_name,
    productList: []
  });

  saveSubscribers(subscribers);
  bot.sendMessage(id, `✅ Hi ${first_name || 'there'}! You are now subscribed and ready to track products.`);
}