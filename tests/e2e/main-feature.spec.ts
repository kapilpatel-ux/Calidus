import { test, expect } from '@playwright/test';
import { dismissToasts, removeEmergentBadge } from '../fixtures/helpers';

const BASE = 'https://trusted-supply-chain.preview.emergentagent.com';

test.describe('Search & Browse Features', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('AI search suggestions appear when typing in navbar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const navSearch = page.getByTestId('navbar').getByTestId('search-input');
    await navSearch.fill('armor');
    // Wait for suggestions dropdown to appear (debounced 300ms + API call)
    await expect(page.getByTestId('search-suggestions')).toBeVisible({ timeout: 10000 });
    // Suggestions should appear with indexed testids
    await expect(page.getByTestId('suggestion-0')).toBeVisible();
  });

  test('search suggestions show type tags (product/supplier/category)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const navSearch = page.getByTestId('navbar').getByTestId('search-input');
    await navSearch.fill('defense');
    await expect(page.getByTestId('search-suggestions')).toBeVisible({ timeout: 10000 });
    // Each suggestion has a type badge
    await expect(page.getByTestId('suggestion-0')).toBeVisible();
    const suggestionText = await page.getByTestId('suggestion-0').textContent();
    expect(suggestionText).toMatch(/product|supplier|category/i);
  });

  test('search form submits and navigates to search results', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const heroSearchInput = page.locator('[data-testid="hero-search-input"]');
    await heroSearchInput.fill('armor');
    await page.locator('[data-testid="hero-search-btn"]').click();
    await expect(page).toHaveURL(/\/search\?q=armor/);
  });

  test('browse components page shows all categories', async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('browse-components-page')).toBeVisible();
    await expect(page.getByTestId('page-title')).toBeVisible();
    // Categories load from API - wait for them
    const categoryLinks = page.locator('a[href*="/category/"]');
    await expect(categoryLinks.first()).toBeVisible({ timeout: 15000 });
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('browse components search works', async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' });
    const browseSearch = page.getByTestId('browse-components-page').getByTestId('search-input');
    await expect(browseSearch).toBeVisible();
    await browseSearch.fill('electronics');
    await page.getByTestId('browse-components-page').getByTestId('search-btn').click();
    await expect(page).toHaveURL(/\/search\?q=electronics/);
  });

  test('category page loads with products', async ({ page }) => {
    await page.goto('/category/electronics', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('category-page')).toBeVisible();
    await expect(page.getByTestId('category-title')).toBeVisible();
    await expect(page.getByTestId('category-title')).toContainText('ELECTRONICS');
  });

  test('category page has filter controls', async ({ page }) => {
    await page.goto('/category/armored-systems', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('category-page')).toBeVisible();
    // Filters sidebar
    await expect(page.getByTestId('filters-sidebar')).toBeVisible();
    await expect(page.getByTestId('clear-filters-btn')).toBeVisible();
  });

  test('category page shows products list', async ({ page }) => {
    await page.goto('/category/armored-systems', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('category-page')).toBeVisible();
    // Products should appear - wait for load
    const productCards = page.locator('a[href*="/product/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
  });

  test('search results page displays results', async ({ page }) => {
    await page.goto('/search?q=armor', { waitUntil: 'domcontentloaded' });
    // Should show search results page
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 10000 });
  });

  test('search results page has filter options', async ({ page }) => {
    await page.goto('/search?q=defense', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 10000 });
    // Results tabs or filters
    await expect(page.locator('body')).toContainText(/products|suppliers|categories/i);
  });
});
