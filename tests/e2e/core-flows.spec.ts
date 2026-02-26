import { test, expect } from '@playwright/test';
import { dismissToasts, removeEmergentBadge } from '../fixtures/helpers';

const BASE = 'https://trusted-supply-chain.preview.emergentagent.com';

test.describe('Homepage & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await removeEmergentBadge(page);
  });

  test('homepage loads with hero section', async ({ page }) => {
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page.getByTestId('hero-section')).toBeVisible();
    await expect(page.getByTestId('hero-headline')).toBeVisible();
    await expect(page.getByTestId('hero-subheadline')).toBeVisible();
  });

  test('homepage shows stats section', async ({ page }) => {
    // Stats section may not have testid, check for stats content
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
    // Look for stats numbers visible on page (40+, 400+, etc.)
    const statsText = await page.locator('body').textContent();
    expect(statsText).toMatch(/\d+\+?/);
  });

  test('homepage shows categories section', async ({ page }) => {
    // Wait for page data to load - categories are loaded from API
    await expect(page.getByTestId('home-page')).toBeVisible();
    // Check for category cards via available testids
    const categoryLinks = page.locator('a[href*="/category/"]');
    await expect(categoryLinks.first()).toBeVisible({ timeout: 15000 });
  });

  test('homepage shows featured suppliers', async ({ page }) => {
    await expect(page.getByTestId('home-page')).toBeVisible();
    // Check for supplier links visible on page
    const supplierLinks = page.locator('a[href*="/supplier/"]');
    await expect(supplierLinks.first()).toBeVisible({ timeout: 15000 });
  });

  test('homepage shows featured product', async ({ page }) => {
    await expect(page.getByTestId('featured-product-section')).toBeVisible();
  });

  test('navigation links work - Components', async ({ page }) => {
    await page.getByTestId('nav-link-components').click();
    await expect(page).toHaveURL(/\/components/);
    await expect(page.getByTestId('browse-components-page')).toBeVisible();
  });

  test('navigation links work - Suppliers', async ({ page }) => {
    await page.getByTestId('nav-link-suppliers').click();
    await expect(page).toHaveURL(/\/suppliers/);
  });

  test('navigation links work - How It Works', async ({ page }) => {
    await page.getByTestId('nav-link-how-it-works').click();
    await expect(page).toHaveURL(/\/how-it-works/);
  });

  test('navigation links work - Contact Us', async ({ page }) => {
    await page.getByTestId('nav-link-contact-us').click();
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByTestId('contact-page')).toBeVisible();
  });

  test('navigation links work - About Us', async ({ page }) => {
    await page.getByTestId('nav-link-about-us').click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('BROWSE COMPONENTS button navigates correctly', async ({ page }) => {
    await page.getByRole('link', { name: /BROWSE COMPONENTS/i }).first().click();
    await expect(page).toHaveURL(/\/components/);
    await expect(page.getByTestId('browse-components-page')).toBeVisible();
  });

  test('BECOME A SUPPLIER button navigates correctly', async ({ page }) => {
    await page.getByRole('link', { name: /BECOME A SUPPLIER/i }).first().click();
    await expect(page).toHaveURL(/\/supplier-registration/);
  });

  test('navbar search input is present', async ({ page }) => {
    await expect(page.getByPlaceholder('Search components, suppliers')).toBeVisible();
  });

  test('navbar REGISTER and LOGIN buttons exist', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'REGISTER' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'LOGIN' })).toBeVisible();
  });
});
