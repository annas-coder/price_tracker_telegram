import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.TELEGRAM_BOT_TOKEN)

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;