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
await page.waitForTimeout(5000);
console.log('After login URL:', page.url());
await page.screenshot({ path: 'C:/tmp/02-after-login.png' });

// --- ARCHIVE ---
await page.goto(`${BASE}/arhiva`);
await page.waitForLoadState('networkidle');
await page.screenshot({ path: 'C:/tmp/03-archive.png' });
const copyBtns = await page.locator('[title="Kreiraj sličan dokument"]').count();
console.log('Kreiraj slican buttons count:', copyBtns);
const novaBtns = await page.locator('[title="Napravi novu verziju"]').count();
console.log('Nova verzija buttons count:', novaBtns);

if (copyBtns > 0) {
  const firstCopy = page.locator('[title="Kreiraj sličan dokument"]').first();
  await firstCopy.click();
  await page.waitForTimeout(2000);
  const url = page.url();
  console.log('Copy URL:', url);
  console.log('Has copy=1:', url.includes('copy=1'));
  console.log('Has from=:', url.includes('from='));
  await page.screenshot({ path: 'C:/tmp/04-wizard-copy.png' });
  const prefilled = await page.locator('input[type="text"]').first().inputValue().catch(() => '');
  console.log('First prefilled value:', JSON.stringify(prefilled));
}

// --- DRAFT SAVE ---
await page.goto(`${BASE}/dokumenti/poslovni-mejl`);
await page.waitForLoadState('networkidle');
await page.screenshot({ path: 'C:/tmp/05-wizard-fresh.png' });
const inp = page.locator('input[type="text"]').first();
const visible = await inp.isVisible().catch(() => false);
console.log('Input visible in wizard:', visible);
if (visible) {
  await inp.fill('Test Draft Korisnik');
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'C:/tmp/06-reloaded.png' });
  const banner = await page.locator('text=Nastavljate gde ste stali').isVisible().catch(() => false);
  const val = await inp.inputValue().catch(() => '');
  console.log('Banner visible:', banner, '| Restored value:', JSON.stringify(val));
  if (banner) {
    await page.locator('text=Počni ispočetka').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'C:/tmp/07-reset.png' });
    const bannerAfter = await page.locator('text=Nastavljate gde ste stali').isVisible().catch(() => false);
    const valAfter = await inp.inputValue().catch(() => '');
    console.log('Banner after reset:', bannerAfter, '| Value after reset:', JSON.stringify(valAfter));
  }
}

await browser.close();
console.log('DONE');
