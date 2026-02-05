import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = '/home/ubuntu/.openclaw/media/inbound/file_11---4bf706c3-17c0-4a39-8bed-d2b1fdd907bd.json';
const BASE_URL = 'http://127.0.0.1:5173';
const OUTPUT_DIR = path.join(__dirname, 'test-evidence');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const results = {
  importSuccess: false,
  btcBenchmark: { tested: false, status: null, error: null, errorMessage: null, screenshot: null },
  bondAnalysis: { tested: false, i18nIssues: [], screenshot: null, error: null },
  consoleLogs: [],
  networkErrors: []
};

async function runTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  
  context.on('console', msg => {
    const log = `[${msg.type()}] ${msg.text()}`;
    results.consoleLogs.push(log);
    console.log(log);
  });

  const page = await context.newPage();
  
  page.on('response', async response => {
    if (!response.ok()) {
      const entry = `Network error: ${response.url()} - Status: ${response.status()}`;
      results.networkErrors.push(entry);
      console.log(entry);
    }
  });

  try {
    // Test Import
    console.log('Step 1: Opening app and importing...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /import/i }).click()
    ]);
    await fileChooser.setFiles(JSON_PATH);
    await page.waitForTimeout(3000);
    
    const content = await page.content();
    results.importSuccess = content.includes('BTC') && !content.includes('No investments yet');
    console.log(`Import: ${results.importSuccess ? 'SUCCESS' : 'FAILED'}`);

    // Test BTC Benchmark
    console.log('Step 2: Testing BTC benchmark...');
    const header = page.locator('header');
    const navButtons = header.locator('button');
    
    if (await navButtons.count() >= 2) {
      await navButtons.nth(1).click();
      await page.waitForTimeout(2000);
      
      const benchmarkSelect = page.locator('select').first();
      if (await benchmarkSelect.count() > 0) {
        const options = await benchmarkSelect.locator('option').allTextContents();
        const btcOption = options.find(o => o.includes('BTC') || o.includes('Bitcoin'));
        
        if (btcOption) {
          await benchmarkSelect.selectOption({ label: btcOption });
          await page.waitForTimeout(3000);
          
          results.btcBenchmark.tested = true;
          results.btcBenchmark.screenshot = path.join(OUTPUT_DIR, 'btc-error.png');
          await page.screenshot({ path: results.btcBenchmark.screenshot, fullPage: true });
          
          // Check for error message in UI
          const errorLocator = page.locator('text=/error|Error/i').first();
          if (await errorLocator.count() > 0) {
            results.btcBenchmark.errorMessage = await errorLocator.textContent();
          }
          
          // Check console for CoinGecko error
          const coingeckoError = results.consoleLogs.find(log => 
            log.includes('CoinGecko') && log.includes('SyntaxError')
          );
          if (coingeckoError) {
            results.btcBenchmark.status = 'PARSE_ERROR';
            results.btcBenchmark.error = 'CoinGecko API returns JavaScript code instead of JSON';
          }
          console.log(`BTC: ${results.btcBenchmark.status || 'OK'}`);
        }
      }
    }

    // Test Bond Analysis Page
    console.log('Step 3: Testing Bond Analysis page...');
    await page.goto(`${BASE_URL}/bond-analysis`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    results.bondAnalysis.screenshot = path.join(OUTPUT_DIR, 'bond-analysis.png');
    await page.screenshot({ path: results.bondAnalysis.screenshot, fullPage: true });
    
    const text = await page.locator('body').textContent();
    const rawKeys = [
      'upcoming.payments',
      'bond.analysis', 
      'payment.schedule',
      'maturity.date',
      'coupon.yield',
      'fixed.income',
      'next.payment'
    ].filter(k => text.toLowerCase().includes(k.toLowerCase()));
    
    // Find dot-notation patterns
    const i18nMatches = text.match(/[a-z]+\.[a-z]+(?:\.[a-z]+)*/g) || [];
    const filtered = [...new Set(i18nMatches.filter(k => 
      !k.match(/^\d+\./) && 
      !k.includes('.com') && 
      !k.includes('http') &&
      k !== 'p.a' &&
      k.split('.').length >= 2
    ))].slice(0, 20);
    
    results.bondAnalysis.i18nIssues = [...new Set([...rawKeys, ...filtered])];
    results.bondAnalysis.tested = true;
    console.log(`Bond i18n found: ${results.bondAnalysis.i18nIssues.length}`);
    
  } catch (e) {
    console.error('Error:', e);
    results.error = e.message;
  }
  
  // Save results
  fs.writeFileSync(path.join(OUTPUT_DIR, 'final-results.json'), JSON.stringify(results, null, 2));
  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

runTest();
