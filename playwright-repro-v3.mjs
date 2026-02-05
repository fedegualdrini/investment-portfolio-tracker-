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
  btcBenchmark: { tested: false, status: null, error: null, requestUrl: null, networkErrors: [] },
  bondAnalysis: { tested: false, i18nIssues: [], screenshot: null },
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
    console.log('Step 1: Opening app...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-initial.png') });

    console.log('Step 2: Importing portfolio...');
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /import/i }).click()
    ]);
    await fileChooser.setFiles(JSON_PATH);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-imported.png'), fullPage: true });

    // Validate import
    const content = await page.content();
    results.importSuccess = content.includes('BTC') && !content.includes('No investments yet');
    console.log(`Import: ${results.importSuccess ? 'SUCCESS' : 'FAILED'}`);

    // Click Performance icon (bar chart icon - 2nd icon in nav)
    console.log('Step 3: Navigating to Performance comparison...');
    const header = page.locator('header');
    const navButtons = header.locator('button');
    console.log(`Found ${await navButtons.count()} nav buttons`);
    
    // The performance icon should be the 2nd button (index 1)
    if (await navButtons.count() >= 2) {
      await navButtons.nth(1).click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03-performance.png'), fullPage: true });

      // Select BTC from benchmark dropdown
      console.log('Step 4: Selecting BTC benchmark...');
      const benchmarkSelect = page.locator('select').first();
      
      if (await benchmarkSelect.count() > 0) {
        // Get all options
        const options = await benchmarkSelect.locator('option').allTextContents();
        console.log('Available benchmarks:', options);
        
        // Find BTC option
        const btcOption = options.find(o => o.includes('BTC') || o.includes('Bitcoin'));
        if (btcOption) {
          await benchmarkSelect.selectOption({ label: btcOption });
          await page.waitForTimeout(3000);
          await page.screenshot({ path: path.join(OUTPUT_DIR, '04-btc-selected.png'), fullPage: true });
          
          results.btcBenchmark.tested = true;
          
          // Check for errors
          const btcErrors = results.networkErrors.filter(e => 
            e.toLowerCase().includes('btc') || 
            e.toLowerCase().includes('bitcoin') ||
            e.toLowerCase().includes('coingecko')
          );
          
          if (btcErrors.length > 0) {
            const err = btcErrors[0];
            const statusMatch = err.match(/Status: (\d+)/);
            results.btcBenchmark.status = statusMatch ? statusMatch[1] : 'error';
            results.btcBenchmark.requestUrl = err.match(/(https?:\/\/[^\s]+)/)?.[1];
            results.btcBenchmark.networkErrors = btcErrors;
          } else {
            results.btcBenchmark.status = '200';
          }
          console.log(`BTC benchmark: ${results.btcBenchmark.status}`);
        } else {
          results.btcBenchmark.error = 'BTC option not in dropdown';
        }
      }
    }

    // Navigate to Bonds/Fixed Income - try 3rd icon
    console.log('Step 5: Looking for Bond Analysis...');
    await page.goto(`${BASE_URL}/bonds`, { waitUntil: 'networkidle' }).catch(async () => {
      // Try clicking different nav buttons
      const header = page.locator('header');
      const navButtons = header.locator('button');
      
      // Try buttons 2 and 3 (0-indexed)
      for (let i = 2; i < Math.min(await navButtons.count(), 4); i++) {
        await navButtons.nth(i).click();
        await page.waitForTimeout(1500);
        const url = page.url();
        if (url.includes('bond') || url.includes('fixed')) {
          break;
        }
      }
    });
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05-bonds.png'), fullPage: true });
    
    // Check for i18n issues
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
    
    // Also find dot-notation patterns
    const i18nMatches = text.match(/[a-z]+\.[a-z]+(?:\.[a-z]+)*/g) || [];
    const filtered = i18nMatches.filter(k => 
      !k.match(/^\d+\./) && 
      !k.includes('.com') && 
      !k.includes('http')
    );
    
    results.bondAnalysis.i18nIssues = [...new Set([...rawKeys, ...filtered])].slice(0, 20);
    results.bondAnalysis.tested = true;
    results.bondAnalysis.screenshot = path.join(OUTPUT_DIR, '05-bonds.png');
    console.log(`Bond i18n issues: ${results.bondAnalysis.i18nIssues.length}`);
    
    // Save results
    fs.writeFileSync(path.join(OUTPUT_DIR, 'results.json'), JSON.stringify(results, null, 2));
    console.log('\n=== RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (e) {
    console.error('Error:', e);
    results.error = e.message;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'results.json'), JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
}

runTest();
