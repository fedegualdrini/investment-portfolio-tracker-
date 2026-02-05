import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: { dir: '/tmp/playwright-videos' }
  });
  const page = await context.newPage();

  const results = {
    benchmark401: null,
    bondI18n: null,
    errors: []
  };

  // Collect console logs and network errors
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[${type}] ${text}`);
    if (type === 'error' || text.includes('401') || text.includes('Unauthorized')) {
      results.errors.push({ type, text });
    }
  });

  page.on('pageerror', err => {
    console.log(`[Page Error] ${err.message}`);
    results.errors.push({ type: 'pageerror', text: err.message });
  });

  page.on('response', async response => {
    const status = response.status();
    const url = response.url();
    if (status === 401 || status >= 400) {
      console.log(`[Network ${status}] ${url}`);
      results.errors.push({ type: 'network', status, url });
    }
  });

  try {
    // A) Open the app
    console.log('\n=== STEP A: Opening app ===');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/01-initial-load.png' });
    console.log('App loaded');

    // Wait for any loading to complete
    await page.waitForTimeout(2000);

    // B) Import portfolio JSON
    console.log('\n=== STEP B: Importing portfolio ===');
    
    // Look for import button - could be Settings or Import
    const importBtn = await page.locator('button:text-matches("Import|Settings", "i")').first();
    if (await importBtn.isVisible().catch(() => false)) {
      await importBtn.click();
      await page.waitForTimeout(500);
    }

    // Try to find file input for import
    const fileInput = await page.locator('input[type="file"]').first();
    if (await fileInput.isVisible().catch(() => false)) {
      await fileInput.setInputFiles('/home/ubuntu/.openclaw/media/inbound/file_11---4bf706c3-17c0-4a39-8bed-d2b1fdd907bd.json');
      await page.waitForTimeout(1000);
      
      // Look for confirm/import button
      const confirmBtn = await page.locator('button:text-matches("Import|Confirm|Load", "i")').first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(2000);
      }
    }
    await page.screenshot({ path: '/tmp/02-after-import.png' });
    console.log('Portfolio imported');

    // C) Navigate to Benchmark section and select BTC
    console.log('\n=== STEP C: Testing Benchmark section (BTC) ===');
    
    // Find and click Benchmark link/button
    const benchmarkLink = await page.locator('a:text-matches("Benchmark|Compare", "i"), button:text-matches("Benchmark|Compare", "i")').first();
    if (await benchmarkLink.isVisible().catch(() => false)) {
      await benchmarkLink.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: '/tmp/03-benchmark-page.png' });
      
      // Look for BTC selector
      const btcOption = await page.locator('text=BTC, button:has-text("BTC"), [data-testid*="btc" i], option[value="BTC"]').first();
      if (await btcOption.isVisible().catch(() => false)) {
        await btcOption.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: '/tmp/04-benchmark-btc.png' });
        
        // Check for 401 errors
        const network401 = results.errors.filter(e => e.status === 401 || e.text?.includes('401'));
        results.benchmark401 = {
          found: network401.length > 0,
          errors: network401,
          consoleErrors: results.errors.filter(e => e.type === 'error')
        };
      } else {
        console.log('BTC option not found on benchmark page');
        results.benchmark401 = { found: false, reason: 'BTC option not found' };
      }
    } else {
      console.log('Benchmark section not found');
      results.benchmark401 = { found: false, reason: 'Benchmark section not found' };
    }

    // D) Navigate to Bond Analysis page
    console.log('\n=== STEP D: Testing Bond Analysis page ===');
    
    // Clear previous errors for this section
    const preBondErrors = [...results.errors];
    
    const bondLink = await page.locator('a:text-matches("Bond|Bonds|Fixed Income", "i"), button:text-matches("Bond|Bonds|Fixed Income", "i")').first();
    if (await bondLink.isVisible().catch(() => false)) {
      await bondLink.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: '/tmp/05-bond-page.png' });
      
      // Look for i18n keys like upcoming.payments
      const pageContent = await page.content();
      const i18nMatches = pageContent.match(/[a-z]+\.[a-z]+(?:\.[a-z]+)*/gi) || [];
      const suspiciousI18n = i18nMatches.filter(k => 
        k.includes('.') && 
        !k.includes('.com') && 
        !k.includes('.org') &&
        !k.includes('.json') &&
        k.split('.').length >= 2
      );
      
      // Also check visible text directly
      const bodyText = await page.locator('body').textContent();
      const textMatches = (bodyText.match(/[a-z]+\.[a-z]+(?:\.[a-z]+)*/gi) || [])
        .filter(k => k.includes('.') && !k.includes('.com'));
      
      results.bondI18n = {
        found: textMatches.length > 0 || suspiciousI18n.length > 0,
        keys: [...new Set([...textMatches, ...suspiciousI18n])],
        screenshot: '/tmp/05-bond-page.png'
      };
      
      console.log('Potential i18n keys found:', results.bondI18n.keys);
    } else {
      console.log('Bond analysis section not found');
      results.bondI18n = { found: false, reason: 'Bond section not found' };
    }

    // Save results
    fs.writeFileSync('/tmp/test-results.json', JSON.stringify(results, null, 2));
    console.log('\n=== RESULTS SAVED TO /tmp/test-results.json ===');
    console.log(JSON.stringify(results, null, 2));

  } catch (err) {
    console.error('Test error:', err);
    results.errors.push({ type: 'fatal', text: err.message });
    fs.writeFileSync('/tmp/test-results.json', JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})();
