import { test, expect, Page } from '@playwright/test';

// ── Helpers ──────────────────────────────────────────────

const BASE = 'http://localhost:3000';
const API = '/api/v1';

const TEST_USER = 'test_admin';
const TEST_PASS = 'test_password';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[autocomplete="username"]', TEST_USER);
  await page.fill('input[autocomplete="current-password"]', TEST_PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 10000 });
}

async function logout(page: Page) {
  await page.goto(`${BASE}/dashboard`);
  await page.click('text=Logout');
  await page.waitForURL(`${BASE}/login`, { timeout: 10000 });
}

async function getCookie(page: Page, name: string): Promise<string | null> {
  const cookies = await page.context().cookies();
  const c = cookies.find((c) => c.name === name);
  return c?.value ?? null;
}

// ── Global Setup: seed a test user ───────────────────────

test.beforeAll(async ({ request }) => {
  // Ensure backend is up
  const health = await request.get(`${BASE}${API}/health`);
  expect(health.ok()).toBeTruthy();
});

// ═══════════════════════════════════════════════════════════
//  SUITE 1: Login Flow
// ═══════════════════════════════════════════════════════════

test.describe('Login Flow (OAuth2 Password Grant)', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[autocomplete="username"]', TEST_USER);
    await page.fill('input[autocomplete="current-password"]', TEST_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${BASE}/dashboard`, { timeout: 10000 });
  });

  test('sets access_token cookie on login', async ({ page }) => {
    await login(page);
    const token = await getCookie(page, 'access_token');
    expect(token).toBeTruthy();
    expect(token?.length).toBeGreaterThan(100); // JWT is long
  });

  test('sets role cookie on login', async ({ page }) => {
    await login(page);
    const role = await getCookie(page, 'role');
    expect(role).toBeTruthy();
  });

  test('invalid credentials shows error', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[autocomplete="username"]', 'wrong');
    await page.fill('input[autocomplete="current-password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
  });

  test('empty form shows validation', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.click('button[type="submit"]');
    // Form should not submit — check no redirect
    await expect(page).toHaveURL(`${BASE}/login`);
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 2: Auth Token Persistence
// ═══════════════════════════════════════════════════════════

test.describe('Auth Token Persistence', () => {
  test('token survives page refresh', async ({ page }) => {
    await login(page);
    const tokenBefore = await getCookie(page, 'access_token');
    expect(tokenBefore).toBeTruthy();

    await page.reload();
    await expect(page).toHaveURL(`${BASE}/dashboard`, { timeout: 10000 });

    const tokenAfter = await getCookie(page, 'access_token');
    expect(tokenAfter).toBe(tokenBefore);
  });

  test('token persists across new tab', async ({ page, browser }) => {
    await login(page);
    const tokenBefore = await getCookie(page, 'access_token');
    expect(tokenBefore).toBeTruthy();

    const context = page.context();
    const newPage = await context.newPage();
    await newPage.goto(`${BASE}/dashboard`);
    await expect(newPage).toHaveURL(`${BASE}/dashboard`, { timeout: 10000 });
    await newPage.close();
  });

  test('logout clears token cookie', async ({ page }) => {
    await login(page);
    await logout(page);
    const token = await getCookie(page, 'access_token');
    expect(token).toBeFalsy();
  });

  test('unauthenticated redirect to login', async ({ page }) => {
    // Fresh context, no cookies
    const context = await page.context().browser().newContext();
    const freshPage = await context.newPage();
    await freshPage.goto(`${BASE}/dashboard`);
    await expect(freshPage).toHaveURL(/\/login/, { timeout: 10000 });
    await freshPage.close();
    await context.close();
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 3: CRUD — pegawai
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Pegawai', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list pegawai', async ({ page }) => {
    await page.goto(`${BASE}/pegawai`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });

  test('create pegawai', async ({ page }) => {
    await page.goto(`${BASE}/pegawai`);
    await page.click('button:has-text("Tambah"), button:has-text("Add"), [data-testid="add"]');
    await page.fill('input[name="nama"], input[placeholder*="Nama"]', `E2E ${Date.now()}`);
    await page.click('button:has-text("Simpan"), button:has-text("Save"), button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('edit pegawai', async ({ page }) => {
    await page.goto(`${BASE}/pegawai`);
    await page.click('tr:first-child td a, tr:first-child button:has-text("Edit")');
    await page.fill('input[name="nama"]', `Edited ${Date.now()}`);
    await page.click('button:has-text("Simpan"), button:has-text("Update"), button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('delete pegawai', async ({ page }) => {
    await page.goto(`${BASE}/pegawai`);
    const countBefore = await page.locator('tbody tr').count();
    await page.click('tr:last-child button:has-text("Hapus"), tr:last-child button:has-text("Delete")');
    await page.click('button:has-text("Ya"), button:has-text("Confirm")');
    const countAfter = await page.locator('tbody tr').count();
    expect(countAfter).toBeLessThan(countBefore);
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 4: CRUD — jabatan
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Jabatan', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list jabatan', async ({ page }) => {
    await page.goto(`${BASE}/jabatan`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });

  test('create jabatan', async ({ page }) => {
    await page.goto(`${BASE}/jabatan`);
    await page.click('button:has-text("Tambah"), button:has-text("Add"), [data-testid="add"]');
    await page.fill('input[name="nama_jabatan"]', `Jabatan E2E ${Date.now()}`);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('edit jabatan', async ({ page }) => {
    await page.goto(`${BASE}/jabatan`);
    await page.click('tr:first-child button:has-text("Edit")');
    await page.fill('input[name="nama_jabatan"]', `Edited ${Date.now()}`);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('delete jabatan', async ({ page }) => {
    await page.goto(`${BASE}/jabatan`);
    const countBefore = await page.locator('tbody tr').count();
    await page.click('tr:last-child button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');
    const countAfter = await page.locator('tbody tr').count();
    expect(countAfter).toBeLessThan(countBefore);
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 5: CRUD — kehadiran
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Kehadiran', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list kehadiran', async ({ page }) => {
    await page.goto(`${BASE}/kehadiran`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });

  test('create kehadiran', async ({ page }) => {
    await page.goto(`${BASE}/kehadiran`);
    await page.click('button:has-text("Tambah"), button:has-text("Add"), [data-testid="add"]');
    await page.selectOption('select[name="status"]', 'hadir');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('edit kehadiran', async ({ page }) => {
    await page.goto(`${BASE}/kehadiran`);
    await page.click('tr:first-child button:has-text("Edit")');
    await page.selectOption('select[name="status"]', 'izin');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('delete kehadiran', async ({ page }) => {
    await page.goto(`${BASE}/kehadiran`);
    const countBefore = await page.locator('tbody tr').count();
    await page.click('tr:last-child button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');
    const countAfter = await page.locator('tbody tr').count();
    expect(countAfter).toBeLessThan(countBefore);
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 6: CRUD — gaji
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Gaji', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list gaji', async ({ page }) => {
    await page.goto(`${BASE}/gaji`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });

  test('create gaji', async ({ page }) => {
    await page.goto(`${BASE}/gaji`);
    await page.click('button:has-text("Tambah"), button:has-text("Add"), [data-testid="add"]');
    await page.fill('input[name="periode"]', `2026-${String(Date.now()).slice(-2)}`);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('edit gaji', async ({ page }) => {
    await page.goto(`${BASE}/gaji`);
    await page.click('tr:first-child button:has-text("Edit")');
    await page.fill('input[name="tunjangan"]', '5000000');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('delete gaji', async ({ page }) => {
    await page.goto(`${BASE}/gaji`);
    const countBefore = await page.locator('tbody tr').count();
    await page.click('tr:last-child button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');
    const countAfter = await page.locator('tbody tr').count();
    expect(countAfter).toBeLessThan(countBefore);
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 7: CRUD — evaluasi
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Evaluasi', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list evaluasi', async ({ page }) => {
    await page.goto(`${BASE}/evaluasi`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });

  test('create evaluasi', async ({ page }) => {
    await page.goto(`${BASE}/evaluasi`);
    await page.click('button:has-text("Tambah"), button:has-text("Add"), [data-testid="add"]');
    await page.fill('input[name="catatan"]', `Evaluasi E2E ${Date.now()}`);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('edit evaluasi', async ({ page }) => {
    await page.goto(`${BASE}/evaluasi`);
    await page.click('tr:first-child button:has-text("Edit")');
    await page.fill('input[name="skor"]', '95');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('delete evaluasi', async ({ page }) => {
    await page.goto(`${BASE}/evaluasi`);
    const countBefore = await page.locator('tbody tr').count();
    await page.click('tr:last-child button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');
    const countAfter = await page.locator('tbody tr').count();
    expect(countAfter).toBeLessThan(countBefore);
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 8: CRUD — pelatihan
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Pelatihan', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list pelatihan', async ({ page }) => {
    await page.goto(`${BASE}/pelatihan`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });

  test('create pelatihan', async ({ page }) => {
    await page.goto(`${BASE}/pelatihan`);
    await page.click('button:has-text("Tambah"), button:has-text("Add"), [data-testid="add"]');
    await page.fill('input[name="nama_diklat"]', `Pelatihan E2E ${Date.now()}`);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('edit pelatihan', async ({ page }) => {
    await page.goto(`${BASE}/pelatihan`);
    await page.click('tr:first-child button:has-text("Edit")');
    await page.fill('input[name="deskripsi"]', `Updated ${Date.now()}`);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('delete pelatihan', async ({ page }) => {
    await page.goto(`${BASE}/pelatihan`);
    const countBefore = await page.locator('tbody tr').count();
    await page.click('tr:last-child button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');
    const countAfter = await page.locator('tbody tr').count();
    expect(countAfter).toBeLessThan(countBefore);
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 9: CRUD — bkn
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: BKN', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list bkn', async ({ page }) => {
    await page.goto(`${BASE}/bkn`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });

  test('sync bkn triggers success', async ({ page }) => {
    await page.goto(`${BASE}/bkn`);
    await page.click('button:has-text("Sync"), button:has-text("Sinkronisasi")');
    await expect(page.locator('text=berhasil, text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 30000 });
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 10: CRUD — fakultas
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Fakultas', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list fakultas', async ({ page }) => {
    await page.goto(`${BASE}/fakultas`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });

  test('create fakultas', async ({ page }) => {
    await page.goto(`${BASE}/fakultas`);
    await page.click('button:has-text("Tambah"), button:has-text("Add"), [data-testid="add"]');
    await page.fill('input[name="nama"]', `Fakultas E2E ${Date.now()}`);
    await page.fill('input[name="kode"]', `FK${Date.now().toString().slice(-4)}`);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('edit fakultas', async ({ page }) => {
    await page.goto(`${BASE}/fakultas`);
    await page.click('tr:first-child button:has-text("Edit")');
    await page.fill('input[name="nama"]', `Edited ${Date.now()}`);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=berhasil, text=success', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('delete fakultas', async ({ page }) => {
    await page.goto(`${BASE}/fakultas`);
    const countBefore = await page.locator('tbody tr').count();
    await page.click('tr:last-child button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');
    const countAfter = await page.locator('tbody tr').count();
    expect(countAfter).toBeLessThan(countBefore);
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 11: CRUD — kepegawaian
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Kepegawaian', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list kepegawaian', async ({ page }) => {
    await page.goto(`${BASE}/kepegawaian`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 12: CRUD — keuangan
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Keuangan', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list keuangan', async ({ page }) => {
    await page.goto(`${BASE}/keuangan`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 13: CRUD — kebijakan
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Kebijakan', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list kebijakan', async ({ page }) => {
    await page.goto(`${BASE}/kebijakan`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 14: CRUD — pengumuman
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Pengumuman', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list pengumuman', async ({ page }) => {
    await page.goto(`${BASE}/pengumuman`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 15: CRUD — kontrak
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Kontrak', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list kontrak', async ({ page }) => {
    await page.goto(`${BASE}/kontrak`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 16: CRUD — lembur
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Lembur', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list lembur', async ({ page }) => {
    await page.goto(`${BASE}/lembur`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 17: CRUD — cuti
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Cuti', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list cuti', async ({ page }) => {
    await page.goto(`${BASE}/cuti`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 18: CRUD — rekap-absen
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Rekap Absen', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list rekap absen', async ({ page }) => {
    await page.goto(`${BASE}/rekap-absen`);
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 19: CRUD — admin/settings
// ═══════════════════════════════════════════════════════════

test.describe('CRUD: Admin Settings', () => {
  beforeEach(async ({ page }) => { await login(page); });
  afterEach(async ({ page }) => { await logout(page); });

  test('list admin settings', async ({ page }) => {
    await page.goto(`${BASE}/admin/settings`);
    await expect(page.locator('table, [role="grid"], form')).toBeVisible({ timeout: 10000 });
  });
});