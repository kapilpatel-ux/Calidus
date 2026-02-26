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
    await expect(page.getByTestId('stats-section')).toBeVisible();
  });

  test('homepage shows categories section', async ({ page }) => {
    await expect(page.getByTestId('categories-section')).toBeVisible();
    // Wait for categories to load from API
    await expect(page.getByTestId('category-card').first()).toBeVisible();
  });

  test('homepage shows featured suppliers', async ({ page }) => {
    await expect(page.getByTestId('suppliers-section')).toBeVisible();
    await expect(page.getByTestId('supplier-card').first()).toBeVisible();
  });

  test('homepage shows featured product', async ({ page }) => {
    await expect(page.getByTestId('featured-product-section')).toBeVisible();
  });

  test('navigation links work - Components', async ({ page }) => {
    await page.getByRole('link', { name: 'Components' }).click();
    await expect(page).toHaveURL(/\/components/);
    await expect(page.getByTestId('browse-components-page')).toBeVisible();
  });

  test('navigation links work - Suppliers', async ({ page }) => {
    await page.getByRole('link', { name: 'Suppliers' }).click();
    await expect(page).toHaveURL(/\/suppliers/);
  });

  test('navigation links work - How It Works', async ({ page }) => {
    await page.getByRole('link', { name: 'How It Works' }).click();
    await expect(page).toHaveURL(/\/how-it-works/);
  });

  test('navigation links work - Contact Us', async ({ page }) => {
    await page.getByRole('link', { name: 'Contact Us' }).click();
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByTestId('contact-page')).toBeVisible();
  });

  test('navigation links work - About Us', async ({ page }) => {
    await page.getByRole('link', { name: 'About Us' }).click();
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
