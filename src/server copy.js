import puppeteer from "puppeteer";
import cron from "node-cron";
import fs from "fs";
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();


async function getProductPrice(url) {
  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();
  await page.goto(url) 

  const products = await page.$$eval('#centerCol', sections => {
    return sections.map(section => {
        const priceEl = section.querySelector('.a-price-whole');
        const nameEl = section.querySelector('#productTitle'); 
        const price = priceEl ? priceEl.textContent.trim()?.replace(/[^0-9.]/g, '') : null;
        const name = nameEl ? nameEl.textContent.trim() : null;
            return { name, price };
        });
    });

  await browser.close();
  

  return products;
}

async function sendTelegram(message) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  const newURL = 'https://api.telegram.org/bot7841044022:AAH1N7FTXnLSGlCbWMqLw82PxBCAWh-QhdM/sendMessage'

  const payload = {
      chat_id: 1256459666,
      text: message 
  }
  console.log(payload)
  try {
    const res = await axios.post(newURL, payload);
    console.log("Telegram response:", res.data); 
  } catch (error) { 
    console.error("Telegram error:", error.response?.data || error.message);
  }
}

getProductPrice("https://www.amazon.ae/Apple-iPhone-15-128-GB/dp/B0CHXHSD5X/ref=sr_1_1_sspa?dib=eyJ2IjoiMSJ9.462y0alhl83jJufPFLpKM6LXu8pKkgZT0_utCxBryiX6g4JP8e8HmZeJTIT5ePoF4tm_YV4TQCLYJy371I2VGaatkoRqCZ_FtAspQyKmoY9tsUeZ1bKTZHmhCBZRdp09oHK2tFtOVLBm8f5dTnjbZPIJTN5tLJpkpKD3TchA1dObHZj7MUQN-06ibtIYRslHBZKWXimmCYaaDp20ijwV0WKN1BWZRpDDQqW0ySjMp8WsEATEHZSxOmCVwbRZnc-5on0nuM6RMyJIc0BqL5k4ikZYBjvuW3Fk5kVjJH_-iTk.55IZGDph1cIkHFaPDZXI-4xoIkvFrxlkMcFjIYMDcAQ&dib_tag=se&keywords=iphone&qid=1754152395&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1")
// getProductPrice("https://www.amazon.ae/Apple-Headphones-Cancellation-Transparency-Personalized/dp/B0DGJ7M995/ref=sr_1_2?crid=3AWZHCRRQQGBG&dib=eyJ2IjoiMSJ9.j5JtXcArd02L95OZl3YcZwz1SUYUrC0_SzgDFocw4M-cS4u8H9GD1YlHQe5e7TD5gTN13hnWLQDTWzJaz_TTngaqnIVYexDTnELYZ191UNUsgPG4etIQ-tWvnkuofLrRQJ2Bl6aY-3B756pqZOndn0dQh7FR4ZduM0pgz2QpjUq5IZLIEtJXGMi48DtjCz-Zjvw2knH7fapQkCni1uFs0PjZWaDz8-Zr_XChkY9puEOGPloVCtMotwc--qqO_yEEm8AmpZwZni1rr9z7rOYjTC4uS6hfPdY1mWW0IfZD_pI.lfBaSXKfS-DdSHA49oqRd3YpsvQxRbQD2q8QrWEfIss&dib_tag=se&keywords=iphone%2Bairpods%2Bpro%2B2&qid=1754154673&sprefix=iphone%2Bairpods%2Bpr%2Caps%2C195&sr=8-2&th=1")