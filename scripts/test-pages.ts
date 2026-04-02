import { chromium, type BrowserContext } from 'playwright';

const BASE = 'http://localhost:3000';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

interface TestResult {
  page: string;
  status: 'pass' | 'fail';
  errors: string[];
  notes: string[];
}

const results: TestResult[] = [];

function add(name: string, status: 'pass' | 'fail', notes: string[] = [], errors: string[] = []) {
  results.push({ page: name, status, notes, errors });
}

async function testPages() {
  const browser = await chromium.launch({ headless: true });

  // Each test gets a fresh context (isolated cookies)
  async function freshContext(): Promise<BrowserContext> {
    return browser.newContext();
  }

  // ===== 1. Homepage =====
  try {
    const ctx = await freshContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const body = await page.textContent('body') || '';
    add('Homepage (/)', 'pass', [
      `Stats: ${body.includes('Places') && body.includes('Cuisines')}`,
      `Hero: ${body.includes('Maginhawa')}`,
    ]);
    await ctx.close();
  } catch (err) { add('Homepage (/)', 'fail', [], [String(err)]); }

  // ===== 2. Places Directory =====
  try {
    const ctx = await freshContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/places`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(4000); // client-side Supabase fetch
    const links = await page.locator('a[href^="/places/"]').count();
    if (links > 0) {
      add('Places Directory (/places)', 'pass', [`Place links: ${links}`]);
    } else {
      add('Places Directory (/places)', 'fail', [], ['No place links found']);
    }
    await ctx.close();
  } catch (err) { add('Places Directory (/places)', 'fail', [], [String(err)]); }

  // ===== 3. Place Detail =====
  try {
    const ctx = await freshContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/places/rodics-diner`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const body = await page.textContent('body') || '';
    const found = body.toLowerCase().includes('rodic');
    add('Place Detail (/places/rodics-diner)', found ? 'pass' : 'fail',
      found ? ['Place data loaded'] : [], found ? [] : ['Place name not found']);
    await ctx.close();
  } catch (err) { add('Place Detail', 'fail', [], [String(err)]); }

  // ===== 4. Edit Place =====
  try {
    const ctx = await freshContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/places/rodics-diner/edit`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const body = await page.textContent('body') || '';
    add('Edit Place', (body.includes('Suggest') || body.includes('Edit')) ? 'pass' : 'fail');
    await ctx.close();
  } catch (err) { add('Edit Place', 'fail', [], [String(err)]); }

  // ===== 5. Signup (fresh context, no prior auth) =====
  try {
    const ctx = await freshContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/auth/signup`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('#displayName', { timeout: 5000 });

    const email = `pw-signup-${Date.now()}@test.com`;
    await page.fill('#displayName', 'Test User');
    await page.fill('#email', email);
    await page.fill('#password', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);

    const body = await page.textContent('body') || '';
    const url = page.url();
    // Local Supabase auto-confirms, so either:
    // - Shows "Check Your Email" confirmation, OR
    // - User is auto-logged in and redirected (also success)
    if (body.includes('Check Your Email') || body.includes('confirmation') || !url.includes('/auth/signup')) {
      add('Signup (/auth/signup)', 'pass', [`Final URL: ${url}`, `Has confirmation: ${body.includes('Check Your Email')}`]);
    } else {
      const toasts = await page.locator('[data-sonner-toast]').allTextContents().catch(() => []);
      add('Signup (/auth/signup)', 'fail',
        [`URL: ${url}`, `Toasts: ${toasts.join('; ') || 'none'}`],
        ['Signup did not succeed']);
    }
    await ctx.close();
  } catch (err) { add('Signup (/auth/signup)', 'fail', [], [String(err)]); }

  // ===== 6. Login (fresh context, create user via API first) =====
  try {
    const testEmail = `pw-login-${Date.now()}@test.com`;
    const testPw = 'testpassword123';

    // Create user via Supabase API directly
    const apiRes = await fetch('http://127.0.0.1:54321/auth/v1/signup', {
      method: 'POST',
      headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPw }),
    });
    const apiData = await apiRes.json();

    const ctx = await freshContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('#email', { timeout: 5000 });

    await page.fill('#email', testEmail);
    await page.fill('#password', testPw);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);

    const finalUrl = page.url();
    const toasts = await page.locator('[data-sonner-toast]').allTextContents().catch(() => []);
    const loginSuccess = !finalUrl.includes('/auth/login') || toasts.some(t => t.includes('success'));
    if (loginSuccess) {
      add('Login (/auth/login)', 'pass', [`URL: ${finalUrl}`, `Toasts: ${toasts.join('; ') || 'none'}`]);
    } else {
      add('Login (/auth/login)', 'fail',
        [`Still on: ${finalUrl}`, `Toasts: ${toasts.join('; ') || 'none'}`, `API: ${JSON.stringify(apiData.error || 'ok')}`],
        ['Login did not succeed']);
    }
    await ctx.close();
  } catch (err) { add('Login (/auth/login)', 'fail', [], [String(err)]); }

  // ===== 7. Admin Redirect (fresh context, no auth) =====
  try {
    const ctx = await freshContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    const url = page.url();
    add('Admin Redirect (/admin)', url.includes('/auth/login') ? 'pass' : 'fail',
      [url.includes('/auth/login') ? 'Redirected to login' : `Final: ${url}`]);
    await ctx.close();
  } catch (err) { add('Admin Redirect (/admin)', 'fail', [], [String(err)]); }

  // ===== 8. Dashboard Redirect (fresh context, no auth) =====
  try {
    const ctx = await freshContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    const url = page.url();
    add('Dashboard Redirect (/dashboard)', url.includes('/auth/login') ? 'pass' : 'fail',
      [url.includes('/auth/login') ? 'Redirected to login' : `Final: ${url}`]);
    await ctx.close();
  } catch (err) { add('Dashboard Redirect (/dashboard)', 'fail', [], [String(err)]); }

  // ===== 9. Sitemap =====
  try {
    const ctx = await freshContext();
    const page = await ctx.newPage();
    const res = await page.goto(`${BASE}/sitemap.xml`, { timeout: 10000 });
    add('Sitemap (/sitemap.xml)', res?.status() === 200 ? 'pass' : 'fail');
    await ctx.close();
  } catch (err) { add('Sitemap (/sitemap.xml)', 'fail', [], [String(err)]); }

  // ===== Results =====
  console.info('\n========== PAGE TEST RESULTS ==========\n');
  for (const r of results) {
    console.info(`${r.status === 'pass' ? '✓' : '✗'} ${r.page}`);
    for (const n of r.notes) console.info(`    ${n}`);
    for (const e of r.errors) console.info(`    ERROR: ${e}`);
  }
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  console.info(`\n${passed} passed, ${failed} failed out of ${results.length}`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

testPages().catch(console.error);
