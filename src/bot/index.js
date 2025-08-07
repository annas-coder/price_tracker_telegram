import TelegramBot from 'node-telegram-bot-api';
import { CronJob } from 'cron';
import { TELEGRAM_BOT_TOKEN } from "../config/index.js"
import { handleStartCommand } from './handlers/startHandler.js';
import { handleMessage } from './handlers/messageHandler.js';
import { startPriceCheckJob } from '../job/priceChecker.js';
import os from 'os';
import { Worker } from 'worker_threads';

const cores = os.cpus().length;
console.log(`You have ${cores} CPU cores.`);

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => handleStartCommand(bot, msg));
bot.on('message', (msg) => handleMessage(bot, msg));

let isRunning 

const job = new CronJob('*/1 * * * * *', async () => {    
    if(isRunning) return 
    isRunning = true;

    try{
        await startPriceCheckJob()
    }
    catch(error){
        console.error('Job failed:', error);
    }
    finally{
      isRunning = false;
    }
});


job.start();