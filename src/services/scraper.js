import puppeteer from 'puppeteer';

export async function getProductPrice(url){
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();

    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';

    await page.setUserAgent(userAgent);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    let products = [];

    if (url.includes('amazon')) {
      products = await page.$$eval('#centerCol', (sections) =>
        sections.map((section) => {
          const priceEl = section.querySelector('.a-price-whole');
          const nameEl = section.querySelector('#productTitle');

          const price = priceEl?.textContent?.trim()?.replace(/,/g, '').replace(/\.00$/, '') || null;
          const name = nameEl?.textContent?.trim() || null;

          return { name, price };
        })
      );
    } else if (url.includes('noon')) {
      products = await page.$$eval('.ProductDetailsDesktop_coreCtr__ZVN_b', (sections) =>
        sections.map((section) => {
          const priceEl = section.querySelector('.PriceOfferV2_priceNowText__fk5kK');
          const nameEl = section.querySelector('.ProductTitle_title__vjUBn');

          const price = priceEl?.textContent?.trim()?.replace(/,/g, '').replace(/\.00$/, '') || null;
          const name = nameEl?.textContent?.trim() || null;

          return { name, price };
        })
      );
    } else {
      products = [{ name: null, price: null }];
    }

    return products;
  } catch (error) {
    console.error('❌ Error in getProductPrice:', error);
    return [{ name: null, price: null }];
  } finally {
    await browser.close();
  }
}
