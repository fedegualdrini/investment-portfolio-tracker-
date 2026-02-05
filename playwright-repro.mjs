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
  btcBenchmark: { tested: false, status: null, error: null, requestUrl: null },
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
    const hasPortfolio = pageContent.includes('portfolio') || pageContent.includes('Total') || pageContent.includes('Value');
    
    results.importSuccess = !hasNoInvestments && (hasBTC || hasPortfolio);
    console.log(`Import validation: ${results.importSuccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`  - No investments message found: ${hasNoInvestments}`);
    console.log(`  - BTC found: ${hasBTC}`);

    // Navigate to Performance/Benchmark section
    console.log('Step 4: Navigating to Performance/Benchmark section...');
    
    // Try to find Performance or Benchmark navigation
    const perfLink = await page.locator('a, button').filter({ hasText: /performance/i }).first();
    const benchmarkLink = await page.locator('a, button').filter({ hasText: /benchmark/i }).first();
    const navToClick = await perfLink.count() > 0 ? perfLink : benchmarkLink;
    
    if (await navToClick.count() > 0) {
      await navToClick.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03-performance-page.png'), fullPage: true });
      
      // Try to select BTC as benchmark
      console.log('Step 5: Selecting BTC as benchmark...');
      const btcOption = await page.locator('option, [role="option"], button, li').filter({ hasText: /BTC|Bitcoin/i }).first();
      
      // Or look for a select dropdown
      const selectElement = await page.locator('select').first();
      if (await selectElement.count() > 0) {
        await selectElement.selectOption({ label: /BTC|Bitcoin/i });
      } else if (await btcOption.count() > 0) {
        await btcOption.click();
      }
      
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '04-btc-selected.png'), fullPage: true });
      
      // Check for error
      const errorContent = await page.content();
      const errorMatch = errorContent.match(/(401|404|error|Error)/i);
      results.btcBenchmark.tested = true;
      results.btcBenchmark.status = errorMatch ? errorMatch[1] : '200';
      
      // Find network request to coingecko or similar
      const networkLog = results.networkErrors.find(e => e.includes('coingecko') || e.includes('api'));
      if (networkLog) {
        const match = networkLog.match(/(https?:\/\/[^\s]+)/);
        results.btcBenchmark.requestUrl = match ? match[1] : 'unknown';
        results.btcBenchmark.status = networkLog.match(/Status: (\d+)/)?.[1] || 'unknown';
      }
      
      console.log(`BTC Benchmark test: ${results.btcBenchmark.status}`);
    } else {
      console.log('Could not find Performance/Benchmark navigation link');
      results.btcBenchmark.error = 'Navigation link not found';
    }

    // Navigate to Bond Analysis section
    console.log('Step 6: Navigating to Bond Analysis section...');
    const bondLink = await page.locator('a, button').filter({ hasText: /bond|fixed income/i }).first();
    
    if (await bondLink.count() > 0) {
      await bondLink.click();
      await page.waitForTimeout(2000);
      
      // Check for i18n key issues (looking for patterns like "upcoming.payments", "bond.analysis", etc.)
      const bondContent = await page.content();
      const i18nKeyPatterns = [
        /upcoming\.\w+/,
        /bond\.\w+/,
        /payments\.\w+/,
        /maturity\.\w+/,
        /yield\.\w+/,
        /[a-z]+\.[a-z]+\.[a-z]+/
      ];
      
      i18nKeyPatterns.forEach(pattern => {
        const matches = bondContent.match(pattern);
        if (matches) {
          results.bondAnalysis.i18nIssues.push(...matches);
        }
      });
      
      // Look for specific patterns in text content
      const textContent = await page.locator('body').textContent();
      const rawKeys = [
        'upcoming.payments',
        'bond.analysis',
        'payment.schedule',
        'maturity.date',
        'coupon.yield'
      ].filter(key => textContent.includes(key));
      
      results.bondAnalysis.i18nIssues.push(...rawKeys);
      results.bondAnalysis.i18nIssues = [...new Set(results.bondAnalysis.i18nIssues)];
      
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
