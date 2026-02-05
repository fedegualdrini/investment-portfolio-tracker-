import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const results = {
    benchmark401: { found: false, errors: [], details: '' },
    bondI18n: { found: false, keys: [], details: '' },
    consoleErrors: [],
    networkErrors: []
  };

  // Console listener
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      results.consoleErrors.push(text);
      console.log(`[Console Error] ${text}`);
    }
  });

  // Network error listener
  page.on('response', async response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400) {
      results.networkErrors.push({ status, url });
      console.log(`[Network ${status}] ${url}`);
    }
  });

  try {
    // Open app
    console.log('Step 1: Opening app...');
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: '/tmp/01-home.png' });
    await page.waitForTimeout(2000);

    // Import portfolio - look for settings/import
    console.log('Step 2: Looking for import/settings...');
    const settingsBtn = page.locator('button').filter({ hasText: /Settings|Import|Config/i }).first();
    if (await settingsBtn.isVisible().catch(() => false)) {
      await settingsBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/02-settings.png' });
    }

    // Try to import file
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible().catch(() => false)) {
      console.log('Import file input found, uploading...');
      await fileInput.setInputFiles('/home/ubuntu/.openclaw/media/inbound/file_11---4bf706c3-17c0-4a39-8bed-d2b1fdd907bd.json');
      await page.waitForTimeout(1000);
      
      const importBtn = page.getByRole('button').filter({ hasText: /Import|Upload|Confirm/i }).first();
      if (await importBtn.isVisible().catch(() => false)) {
        await importBtn.click();
        await page.waitForTimeout(3000);
      }
    }
    await page.screenshot({ path: '/tmp/03-after-import.png' });

    // Navigate to Benchmark
    console.log('Step 3: Navigating to Benchmark...');
    const benchmarkLink = page.getByRole('link').filter({ hasText: /Benchmark|Compare/i }).first();
    const benchmarkBtn = page.getByRole('button').filter({ hasText: /Benchmark|Compare/i }).first();
    
    if (await benchmarkLink.isVisible().catch(() => false)) {
      await benchmarkLink.click();
    } else if (await benchmarkBtn.isVisible().catch(() => false)) {
      await benchmarkBtn.click();
    } else {
      // Try nav links
      const nav = page.locator('nav a, header a, [role="navigation"] a');
      const links = await nav.all();
      for (const link of links) {
        const text = await link.textContent().catch(() => '');
        if (text.toLowerCase().includes('benchmark')) {
          await link.click();
          break;
        }
      }
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/04-benchmark.png' });

    // Look for BTC selection
    console.log('Step 4: Looking for BTC benchmark...');
    const btcOption = page.locator('text=BTC, [data-testid*="btc"], option:has-text("BTC"), button:has-text("BTC")').first();
    const select = page.locator('select').first();
    
    if (await select.isVisible().catch(() => false)) {
      // Try selecting BTC from dropdown
      const options = await select.locator('option').allTextContents();
      console.log('Dropdown options:', options);
      
      if (options.some(o => o.includes('BTC'))) {
        await select.selectOption({ label: options.find(o => o.includes('BTC')) });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '/tmp/05-benchmark-btc.png' });
      }
    } else if (await btcOption.isVisible().catch(() => false)) {
      await btcOption.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '/tmp/05-benchmark-btc.png' });
    }

    // Check for 401s
    const benchmark401Errors = results.networkErrors.filter(e => e.status === 401);
    results.benchmark401 = {
      found: benchmark401Errors.length > 0,
      errors: benchmark401Errors,
      consoleErrors: results.consoleErrors.filter(e => e.includes('401') || e.includes('unauthorized')),
      details: benchmark401Errors.map(e => `${e.status} ${e.url}`).join(', ') || 'No 401 errors detected'
    };

    // Navigate to Bond Analysis
    console.log('Step 5: Navigating to Bond Analysis...');
    const bondLink = page.getByRole('link').filter({ hasText: /Bond|Fixed Income/i }).first();
    const bondBtn = page.getByRole('button').filter({ hasText: /Bond|Fixed Income/i }).first();
    
    const nav = page.locator('nav a, header a, [role="navigation"] a, nav button');
    const links = await nav.all();
    for (const link of links) {
      const text = await link.textContent().catch(() => '');
      if (text.toLowerCase().includes('bond') || text.toLowerCase().includes('fixed')) {
        await link.click();
        break;
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/06-bonds.png' });

    // Check for i18n keys
    const pageText = await page.locator('body').textContent();
    const i18nPattern = /\b[a-z]+\.[a-z]+(?:\.[a-z]+)*\b/g;
    const potentialKeys = pageText.match(i18nPattern) || [];
    
    // Filter out valid domain-like strings
    const suspiciousKeys = potentialKeys.filter(k => 
      k.includes('.') && 
      !k.includes('.com') && 
      !k.includes('.org') &&
      k.split('.').length >= 2 &&
      !k.match(/^[0-9.]+$/)
    );

    results.bondI18n = {
      found: suspiciousKeys.length > 0,
      keys: [...new Set(suspiciousKeys)],
      sampleText: pageText.substring(0, 500),
      details: suspiciousKeys.length > 0 
        ? `Found keys: ${[...new Set(suspiciousKeys)].join(', ')}` 
        : 'No raw i18n keys detected in page text'
    };

    // Save results
    fs.writeFileSync('/tmp/test-results.json', JSON.stringify(results, null, 2));
    console.log('\n=== RESULTS ===');
    console.log(JSON.stringify(results, null, 2));

  } catch (err) {
    console.error('Test error:', err);
    results.error = err.message;
    fs.writeFileSync('/tmp/test-results.json', JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})();
