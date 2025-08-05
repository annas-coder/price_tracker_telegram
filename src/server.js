import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import puppeteer from "puppeteer";

import dotenv from 'dotenv';

dotenv.config();

const FILE_PATH = "./src/users.json"
  
const TOKEN = '7841044022:AAH1N7FTXnLSGlCbWMqLw82PxBCAWh-QhdM'

const bot = new TelegramBot(TOKEN, { polling: true });

// Listen for /start command
bot.onText(/\/start/, (msg) => {
  checkSubscribers(msg);  
});

bot.on('message', async (getMsg) => {
  const { chat: { id, first_name }, text } = getMsg;

  if (text === '/start') {
    return;
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  if (!urlRegex.test(text)) {
    bot.sendMessage(id, '❌ Please send a valid product URL.');
    return;
  }

  const { subscribers } = await readSubscribers(); // async version

  const getSubscribeIndex = subscribers.findIndex(sub => sub.id === id);

  if (getSubscribeIndex === -1) {
    bot.sendMessage(id, '⚠️ You are not subscribed yet. Send /start first!');
    return;
  }

  bot.sendMessage(id, '⏳ Scraping product details, please wait...');

  const productDetail = await getProductPrice(text);

  if (!productDetail || !productDetail[0].price) {
    bot.sendMessage(id, '❌ Sorry, could not get product details. The site may block scraping.');
    return;
  }

  subscribers[getSubscribeIndex].productList.push({
    id: subscribers[getSubscribeIndex].productList.length + 1,
    url: text,
    ...productDetail[0],
  });

  saveSubscribers(subscribers); // always await!

  bot.sendMessage(
    id,
    `✅ Product *${productDetail[0].name || 'Unknown'}* saved!  You’ll get a notification if the price drops.`);
});

const checkSubscribers = (getMsg) =>{
  const { chat : { id , first_name , last_name } } = getMsg
  const { subscribers } = readSubscribers();
  let sentMessge = ''
    
  const getChatIdIndex =  subscribers.findIndex(subscribersItem=> subscribersItem.id == id)

  if(getChatIdIndex == -1){
    subscribers.push({
      id,
      first_name,
      last_name,
      productList : []
    })
    sentMessge = `Hi ${first_name || 'there'}! You are now subscribed.`
    saveSubscribers(subscribers);
  }
  else{
    sentMessge = `Hi ${first_name || 'there'}! you have already subscribed.`
  }

  bot.sendMessage(id,sentMessge);
}

const saveSubscribers = (data) =>{
    fs.writeFileSync(FILE_PATH, JSON.stringify({ subscribers: data }, null, 2));
}

const readSubscribers = () =>{  
    if(!fs.existsSync(FILE_PATH)){
        console.log('Not exisiting file')
         fs.writeFileSync(FILE_PATH, JSON.stringify({ subscribers: [] }, null, 2));
        return 
    }
    const raw = fs.readFileSync(FILE_PATH)
    
    return JSON.parse(raw)
}

async function getProductPrice(url) {
  const browser = await puppeteer.launch({
    headless: true,
  }); 

  
  const page = await browser.newPage();  
 
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';

  page.setUserAgent(ua)

  await page.goto(url,{ waitUntil: 'domcontentloaded', timeout: 30000 }) 
  let products =  '' 

  if(url.includes('amazon')){   
     products = await page.$$eval('#centerCol', sections => {
      return sections.map(section => {
          const priceEl = section.querySelector('.a-price-whole');
          const nameEl = section.querySelector('#productTitle'); 
          const price = priceEl ? priceEl.textContent.trim()?.replace(/,/g, '').replace(/\.00$/, '') : null;
          const name = nameEl ? nameEl.textContent.trim() : null;
              return { name, price };
          });      
      });
  }
  else if(url.includes('noon')){
      products = await page.$$eval('.ProductDetailsDesktop_coreCtr__ZVN_b', sections => {
            return sections.map(section => {
                const priceEl = section.querySelector('.PriceOfferV2_priceNowText__fk5kK');
                const nameEl = section.querySelector('.ProductTitle_title__vjUBn'); 
                const price = priceEl ? priceEl.textContent.trim()?.replace(/,/g, '').replace(/\.00$/, '') : null;
                const name = nameEl ? nameEl.textContent.trim() : null;
                    return { name, price };
                });
      });
  }
  else{
    products = [{ name: null, price: null }];
  }

  await browser.close();
  
  return products;
}