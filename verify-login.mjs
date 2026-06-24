import { chromium } from 'playwright';
const BASE = 'http://localhost:3333';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/login`);
await page.waitForLoadState('networkidle');
await page.locator('input[placeholder="vas@email.com"]').fill('dambus.dev@gmail.com');
await page.locator('input[type="password"]').fill('Milan9422!');
await page.locator('button[type="submit"]').click();
await page.waitForURL(url => !url.includes('/login'), { timeout: 15000 });
console.log('Logged in, URL:', page.url());
await page.screenshot({ path: 'C:/tmp/02-after-login.png' });
await browser.close();
console.log('DONE');
