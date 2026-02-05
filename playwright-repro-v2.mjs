import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = '/home/ubuntu/.openclaw/media/inbound/file_11---4bf706c3-17c0-4a39-8bed-d2b1fdd907bd.json';
const BASE_URL = 'http://127.0.0.1:5173';
const OUTPUT_DIR = path.join(__dirname, 'test-evidence');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const results = {
  importSuccess: false,
  btcBenchmark: { tested: false, status: null, error: null, requestUrl: null, networkError: null },
  bondAnalysis: { tested: false, i18nIssues: [], screenshot: null },
  consoleLogs: [],
  networkErrors: []
};

async function runTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  // Capture console logs
  context.on('console', async msg => {
    const logEntry = `[${msg.type()}] ${msg.text()}`;
    results.consoleLogs.push(logEntry);
    console.log(logEntry);
  });

  const page = await context.newPage();

  // Capture failed network requests
  page.on('response', async response => {
    if (!response.ok()) {
      const requestUrl = response.url();
      const status = response.status();
      const errorEntry = `Network error: ${requestUrl} - Status: ${status}`;
      results.networkErrors.push(errorEntry);
      console.log(errorEntry);
    }
  });

  try {
    console.log('Step 1: Opening app...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-initial-page.png'), fullPage: true });

    console.log('Step 2: Importing portfolio JSON...');
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /import/i }).click()
    ]);
    await fileChooser.setFiles(JSON_PATH);
    
    // Wait for import to process
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-after-import.png'), fullPage: true });

    // Validate import succeeded
    console.log('Step 3: Validating import...');
    const pageContent = await page.content();
    const hasNoInvestments = pageContent.includes('No investments yet');
    const hasBTC = pageContent.includes('BTC');
    
    results.importSuccess = !hasNoInvestments && hasBTC;
    console.log(`Import validation: ${results.importSuccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`  - No investments message found: ${hasNoInvestments}`);
    console.log(`  - BTC found: ${hasBTC}`);

    // Navigate to Performance Comparison section
    console.log('Step 4: Navigating to Performance section...');
    await page.getByRole('button', { name: /add investment/i }).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    
    // Click on Performance link in navigation
    const perfLink = page.locator('a').filter({ hasText: /performance/i });
    if (await perfLink.count() > 0) {
      await perfLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03-performance-page.png'), fullPage: true });
      
      // Select BTC as benchmark
      console.log('Step 5: Selecting BTC as benchmark...');
      const benchmarkSelect = page.locator('select').filter({ has: page.locator('option:has-text("S&P 500")') }).first();
      
      if (await benchmarkSelect.count() > 0) {
        // Open dropdown and select BTC
        await benchmarkSelect.click();
        await page.waitForTimeout(500);
        
        // Find and click BTC option
        const btcOption = page.locator('option', { hasText: /Bitcoin|BTC/i });
        if (await btcOption.count() > 0) {
          await benchmarkSelect.selectOption({ label: await btcOption.first().textContent() });
          await page.waitForTimeout(3000); // Wait for data fetch
          
          results.btcBenchmark.tested = true;
          
          // Check for specific BTC network error (401)
          const btcNetworkError = results.networkErrors.find(e => 
            e.includes('BTC') || e.includes('bitcoin') || e.includes('coingecko')
          );
          
          if (btcNetworkError) {
            const match = btcNetworkError.match(/Status: (\d+)/);
            results.btcBenchmark.status = match ? match[1] : 'error';
            results.btcBenchmark.requestUrl = btcNetworkError.match(/(https?:\/\/[^\s]+)/)?.[1] || 'unknown';
          } else {
            results.btcBenchmark.status = '200';
          }
          
          await page.screenshot({ path: path.join(OUTPUT_DIR, '04-btc-benchmark.png'), fullPage: true });
          console.log(`BTC Benchmark test completed - Status: ${results.btcBenchmark.status}`);
        } else {
          results.btcBenchmark.error = 'BTC option not found in dropdown';
          console.log('BTC option not found in benchmark dropdown');
        }
      } else {
        results.btcBenchmark.error = 'Benchmark dropdown not found';
        console.log('Benchmark dropdown not found');
      }
    }

    // Navigate to Bond Analysis section
    console.log('Step 6: Navigating to Bond Analysis section...');
    const bondLink = page.locator('a').filter({ hasText: /bonds|fixed income/i });
    
    if (await bondLink.count() > 0) {
      await bondLink.click();
      await page.waitForTimeout(2000);
      
      // Get page content for i18n analysis
      const textContent = await page.locator('body').textContent();
      
      // Look for raw i18n keys (dot-notation patterns that look like translation keys)
      const i18nPattern = /[a-z]+\.[a-z]+(?:\.[a-z]+)*/g;
      const potentialKeys = textContent.match(i18nPattern) || [];
      
      // Filter for likely i18n keys (common patterns)
      const suspiciousKeys = potentialKeys.filter(k => 
        k.includes('.') && 
        !k.match(/\d+\.\d+/) && // Exclude version numbers
        !k.includes('.com') && 
        !k.includes('.org') &&
        k.split('.').length >= 2
      );
      
      // Also check for specific keys mentioned in the card
      const specificKeys = [
        'upcoming.payments',
        'bond.analysis',
        'maturity.date',
        'coupon.yield',
        'payment.schedule'
      ].filter(key => textContent.toLowerCase().includes(key.toLowerCase()));
      
      results.bondAnalysis.i18nIssues = [...new Set([...specificKeys, ...suspiciousKeys.slice(0, 20)])];
      results.bondAnalysis.tested = true;
      results.bondAnalysis.screenshot = path.join(OUTPUT_DIR, '05-bond-analysis.png');
      
      await page.screenshot({ path: results.bondAnalysis.screenshot, fullPage: true });
      console.log(`Bond analysis i18n issues found: ${results.bondAnalysis.i18nIssues.length}`);
      results.bondAnalysis.i18nIssues.forEach(key => console.log(`  - ${key}`));
    } else {
      console.log('Could not find Bond Analysis navigation link');
      results.bondAnalysis.error = 'Navigation link not found';
    }

    // Save results
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'test-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\n=== TEST RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('Test error:', error);
    results.error = error.message;
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'test-results.json'),
      JSON.stringify(results, null, 2)
    );
  } finally {
    await browser.close();
  }
}

runTest().catch(console.error);
