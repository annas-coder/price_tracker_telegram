import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_TOKEN } from "../config/index.js"
import { handleStartCommand } from './handlers/startHandler.js';
import { handleMessage } from './handlers/messageHandler.js';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => handleStartCommand(bot, msg));
bot.on('message', (msg) => handleMessage(bot, msg));