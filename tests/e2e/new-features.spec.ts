import { test, expect } from '@playwright/test';
import { dismissToasts, removeEmergentBadge } from '../fixtures/helpers';

test.describe('Floating AI Search Button', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('AI search button is visible on homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const aiSearchBtn = page.getByTestId('ai-search-button');
    await expect(aiSearchBtn).toBeVisible({ timeout: 10000 });
  });

  test('AI search button opens search panel when clicked', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const aiSearchBtn = page.getByTestId('ai-search-button');
    await aiSearchBtn.click({ force: true });
    
    const searchPanel = page.getByTestId('ai-search-panel');
    await expect(searchPanel).toBeVisible({ timeout: 5000 });
    
    // Verify panel header
    await expect(searchPanel).toContainText('AI-POWERED SEARCH');
    
    // Verify search input is present
    const searchInput = page.getByTestId('ai-search-input');
    await expect(searchInput).toBeVisible();
  });

  test('AI search panel has close button that works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const aiSearchBtn = page.getByTestId('ai-search-button');
    await aiSearchBtn.click({ force: true });
    
    await expect(page.getByTestId('ai-search-panel')).toBeVisible();
    
    // Close the panel
    await page.getByTestId('close-search-panel').click();
    
    // Panel should be hidden
    await expect(page.getByTestId('ai-search-panel')).not.toBeVisible();
  });

  test('AI search panel shows quick search tags', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('ai-search-button').click({ force: true });
    
    const panel = page.getByTestId('ai-search-panel');
    await expect(panel).toBeVisible();
    
    // Quick search tags should be visible
    await expect(panel).toContainText('Quick search:');
    await expect(panel).toContainText('UAV Propulsion');
    await expect(panel).toContainText('Thermal Imaging');
  });

  test('AI search panel shows suggestions when typing', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('ai-search-button').click({ force: true });
    
    const searchInput = page.getByTestId('ai-search-input');
    await searchInput.fill('armor');
    
    // Wait for suggestions (debounced + API call)
    await page.waitForTimeout(500);
    
    // Should show results section (Products/Suppliers/Categories headers)
    const panel = page.getByTestId('ai-search-panel');
    await expect(panel).toContainText(/Products|Suppliers|Categories/i, { timeout: 10000 });
  });

  test('AI search panel navigates to search results on form submit', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('ai-search-button').click({ force: true });
    
    const searchInput = page.getByTestId('ai-search-input');
    await searchInput.fill('tactical radio');
    await searchInput.press('Enter');
    
    await expect(page).toHaveURL(/\/search\?q=tactical%20radio/i, { timeout: 10000 });
  });

  test('AI search button is visible on Components page', async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' });
    const aiSearchBtn = page.getByTestId('ai-search-button');
    await expect(aiSearchBtn).toBeVisible({ timeout: 10000 });
  });

  test('AI search button is visible on Suppliers page', async ({ page }) => {
    await page.goto('/suppliers', { waitUntil: 'domcontentloaded' });
    const aiSearchBtn = page.getByTestId('ai-search-button');
    await expect(aiSearchBtn).toBeVisible({ timeout: 10000 });
  });

  test('AI search button is visible on Contact page', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    const aiSearchBtn = page.getByTestId('ai-search-button');
    await expect(aiSearchBtn).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Product Listing Form - Step 1 (Basic Info)', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await removeEmergentBadge(page);
    await page.goto('/list-product', { waitUntil: 'domcontentloaded' });
  });

  test('Product listing page loads correctly', async ({ page }) => {
    await expect(page.getByTestId('product-listing-page')).toBeVisible();
    await expect(page.getByTestId('page-title')).toBeVisible();
    await expect(page.getByTestId('page-title')).toContainText('LIST A NEW');
    await expect(page.getByTestId('page-title')).toContainText('DEFENSE PRODUCT');
  });

  test('Step 1 is shown by default', async ({ page }) => {
    await expect(page.getByTestId('step-1')).toBeVisible();
    await expect(page.locator('text=PRODUCT INFORMATION')).toBeVisible();
  });

  test('Step 1 has all required form fields', async ({ page }) => {
    await expect(page.getByTestId('product-name')).toBeVisible();
    await expect(page.getByTestId('category-select')).toBeVisible();
    await expect(page.getByTestId('subcategory-select')).toBeVisible();
    await expect(page.getByTestId('short-description')).toBeVisible();
    await expect(page.getByTestId('description')).toBeVisible();
  });

  test('Next button shows validation error when fields are empty', async ({ page }) => {
    await page.getByTestId('next-btn').click();
    
    // Should still be on step 1 (toast error shown)
    await expect(page.getByTestId('step-1')).toBeVisible();
  });

  test('Can fill Step 1 and proceed to Step 2', async ({ page }) => {
    // Fill product name
    await page.getByTestId('product-name').fill('Test Defense Product');
    
    // Select category
    await page.getByTestId('category-select').click();
    await page.getByRole('option', { name: 'Electronics' }).click();
    
    // Fill short description
    await page.getByTestId('short-description').fill('Test short description for product');
    
    // Fill full description
    await page.getByTestId('description').fill('This is a test full description for the defense product listing form test.');
    
    // Click Next
    await page.getByTestId('next-btn').click();
    
    // Should be on Step 2
    await expect(page.getByTestId('step-2')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=TECHNICAL SPECIFICATIONS')).toBeVisible();
  });
});

test.describe('Product Listing Form - Step 2 (Specifications)', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await removeEmergentBadge(page);
    await page.goto('/list-product', { waitUntil: 'domcontentloaded' });
    
    // Fill Step 1 and proceed
    await page.getByTestId('product-name').fill('Test Product');
    await page.getByTestId('category-select').click();
    await page.getByRole('option', { name: 'Electronics' }).click();
    await page.getByTestId('short-description').fill('Test short desc');
    await page.getByTestId('description').fill('Test full description');
    await page.getByTestId('next-btn').click();
    await expect(page.getByTestId('step-2')).toBeVisible();
  });

  test('Step 2 shows specification fields', async ({ page }) => {
    await expect(page.getByTestId('spec-key')).toBeVisible();
    await expect(page.getByTestId('spec-value')).toBeVisible();
    await expect(page.getByTestId('add-spec-btn')).toBeVisible();
    await expect(page.getByTestId('dimensions')).toBeVisible();
    await expect(page.getByTestId('weight')).toBeVisible();
    await expect(page.getByTestId('operating-temp')).toBeVisible();
  });

  test('Can add custom specifications', async ({ page }) => {
    await page.getByTestId('spec-key').fill('Range');
    await page.getByTestId('spec-value').fill('100km');
    await page.getByTestId('add-spec-btn').click();
    
    // Verify spec was added
    await expect(page.locator('text=Range:')).toBeVisible();
    await expect(page.locator('text=100km')).toBeVisible();
  });

  test('Can toggle certifications', async ({ page }) => {
    const isoCert = page.getByTestId('cert-iso-9001:2015');
    await isoCert.click();
    
    // Should be highlighted (selected state)
    await expect(isoCert).toHaveClass(/bg-\[#00CED1\]/);
  });

  test('Can proceed to Step 3', async ({ page }) => {
    await page.getByTestId('dimensions').fill('100x50x30 cm');
    await page.getByTestId('next-btn').click();
    
    await expect(page.getByTestId('step-3')).toBeVisible();
    await expect(page.locator('text=PRICING & DELIVERY')).toBeVisible();
  });

  test('Back button returns to Step 1', async ({ page }) => {
    await page.getByTestId('back-btn').click();
    await expect(page.getByTestId('step-1')).toBeVisible();
  });
});

test.describe('Product Listing Form - Step 3 (Pricing)', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await removeEmergentBadge(page);
    await page.goto('/list-product', { waitUntil: 'domcontentloaded' });
    
    // Navigate to Step 3
    await page.getByTestId('product-name').fill('Test Product');
    await page.getByTestId('category-select').click();
    await page.getByRole('option', { name: 'Electronics' }).click();
    await page.getByTestId('short-description').fill('Test short desc');
    await page.getByTestId('description').fill('Test full description');
    await page.getByTestId('next-btn').click();
    await page.getByTestId('next-btn').click();
    await expect(page.getByTestId('step-3')).toBeVisible();
  });

  test('Step 3 shows pricing fields', async ({ page }) => {
    await expect(page.getByTestId('price-range')).toBeVisible();
    await expect(page.getByTestId('currency-select')).toBeVisible();
    await expect(page.getByTestId('lead-time-select')).toBeVisible();
    await expect(page.getByTestId('delivery-type-select')).toBeVisible();
    await expect(page.getByTestId('image-url')).toBeVisible();
  });

  test('Can select currency', async ({ page }) => {
    await page.getByTestId('currency-select').click();
    await page.getByRole('option', { name: /EUR/ }).click();
    
    // Currency should be updated
    await expect(page.getByTestId('currency-select')).toContainText('EUR');
  });

  test('Can select lead time', async ({ page }) => {
    await page.getByTestId('lead-time-select').click();
    await page.getByRole('option', { name: '4-6 weeks' }).click();
    
    await expect(page.getByTestId('lead-time-select')).toContainText('4-6 weeks');
  });

  test('Can select delivery type', async ({ page }) => {
    await page.getByTestId('delivery-type-select').click();
    await page.getByRole('option', { name: 'Made to Order' }).click();
    
    await expect(page.getByTestId('delivery-type-select')).toContainText('Made to Order');
  });

  test('Can proceed to Step 4', async ({ page }) => {
    await page.getByTestId('next-btn').click();
    
    await expect(page.getByTestId('step-4')).toBeVisible();
    await expect(page.locator('text=REVIEW & SUBMIT')).toBeVisible();
  });
});

test.describe('Product Listing Form - Step 4 (Review & Submit)', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await removeEmergentBadge(page);
    await page.goto('/list-product', { waitUntil: 'domcontentloaded' });
    
    // Navigate through all steps
    await page.getByTestId('product-name').fill('Complete Test Product');
    await page.getByTestId('category-select').click();
    await page.getByRole('option', { name: 'Electronics' }).click();
    await page.getByTestId('short-description').fill('Complete test short description');
    await page.getByTestId('description').fill('Complete test full description for review');
    await page.getByTestId('next-btn').click();
    
    // Step 2
    await page.getByTestId('dimensions').fill('50x30x20 cm');
    await page.getByTestId('weight').fill('5 kg');
    await page.getByTestId('next-btn').click();
    
    // Step 3
    await page.getByTestId('price-range').fill('$5,000 - $10,000');
    await page.getByTestId('next-btn').click();
    
    await expect(page.getByTestId('step-4')).toBeVisible();
  });

  test('Step 4 shows review summary', async ({ page }) => {
    await expect(page.locator('text=REVIEW & SUBMIT')).toBeVisible();
    await expect(page.locator('text=Product Information')).toBeVisible();
    await expect(page.locator('text=Technical Specifications')).toBeVisible();
    await expect(page.locator('text=Pricing & Delivery')).toBeVisible();
  });

  test('Step 4 shows filled data correctly', async ({ page }) => {
    const step4 = page.getByTestId('step-4');
    
    // Check product name
    await expect(step4.locator('text=Complete Test Product')).toBeVisible();
    
    // Check category within the step-4 section specifically
    await expect(step4.getByText('Electronics').first()).toBeVisible();
    
    // Check dimensions
    await expect(step4.locator('text=50x30x20 cm')).toBeVisible();
    
    // Check price range
    await expect(step4.locator('text=$5,000 - $10,000')).toBeVisible();
  });

  test('Submit button is present', async ({ page }) => {
    await expect(page.getByTestId('submit-btn')).toBeVisible();
    await expect(page.getByTestId('submit-btn')).toContainText('SUBMIT FOR REVIEW');
  });

  test('Can submit form successfully', async ({ page }) => {
    await page.getByTestId('submit-btn').click();
    
    // Should redirect to homepage after success
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });
});
