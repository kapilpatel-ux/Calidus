import { test, expect } from '@playwright/test';
import { dismissToasts, removeEmergentBadge } from '../fixtures/helpers';

const BASE = 'https://trusted-supply-chain.preview.emergentagent.com';

function uniqueEmail() {
  return `buyer_${Date.now()}@testdefense.com`;
}

test.describe('Golden Path - Defense Connect End-to-End Journey', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('full buyer journey: browse → category → product → inquiry', async ({ page }) => {
    // 1. Start at homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page.getByTestId('hero-headline')).toBeVisible();

    // 2. Navigate to browse components
    await page.getByTestId('nav-link-components').click();
    await expect(page).toHaveURL(/\/components/);
    await expect(page.getByTestId('browse-components-page')).toBeVisible();

    // 3. Click on a category card
    await expect(page.getByTestId('category-card-0')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('category-card-0').click();
    await expect(page).toHaveURL(/\/category\//);
    await expect(page.getByTestId('category-page')).toBeVisible();

    // 4. Click on a product (if products available)
    const productCard = page.getByTestId('product-card-0');
    const hasProducts = await productCard.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (hasProducts) {
      await page.getByTestId('view-details-0').click({ force: true });
      await expect(page.getByTestId('product-page')).toBeVisible();
      await expect(page.getByTestId('product-title')).toBeVisible();

      // 5. Click contact supplier
      await page.getByTestId('contact-supplier-btn').click({ force: true });
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByTestId('inquiry-name')).toBeVisible();
    }
  });

  test('search journey: type query → see suggestions → view results', async ({ page }) => {
    // 1. Homepage search with AI suggestions
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const navSearch = page.getByTestId('navbar').getByTestId('search-input');
    await navSearch.fill('armor');
    
    // 2. Suggestions appear
    await expect(page.getByTestId('search-suggestions')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('suggestion-0')).toBeVisible();

    // 3. Submit search
    await navSearch.press('Enter');
    await expect(page).toHaveURL(/\/search\?q=armor/);
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 10000 });
  });

  test('supplier journey: view suppliers list → supplier profile → contact', async ({ page }) => {
    // 1. Navigate to suppliers
    await page.goto('/suppliers', { waitUntil: 'domcontentloaded' });
    const supplierLinks = page.locator('a[href*="/supplier/"]');
    await expect(supplierLinks.first()).toBeVisible({ timeout: 15000 });

    // 2. Click on first supplier
    await supplierLinks.first().click({ force: true });
    await expect(page.getByTestId('supplier-page')).toBeVisible();
    await expect(page.getByTestId('supplier-title')).toBeVisible();

    // 3. Click contact supplier
    await page.getByTestId('contact-supplier-btn').click({ force: true });
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('registration journey: register → login → see homepage as authenticated user', async ({ page }) => {
    const email = uniqueEmail();

    // 1. Register
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('register-name').fill('TEST Buyer User');
    await page.getByTestId('register-email').fill(email);
    await page.getByTestId('register-password').fill('TestPass789!');
    await page.getByTestId('register-submit').click({ force: true });
    
    // 2. Should redirect to homepage as authenticated
    await expect(page).toHaveURL('/', { timeout: 15000 });
    await expect(page.getByTestId('logout-btn')).toBeVisible({ timeout: 5000 });

    // 3. Logout
    await page.getByTestId('logout-btn').click({ force: true });

    // 4. Login again
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill('TestPass789!');
    await page.getByTestId('login-submit').click({ force: true });

    await expect(page).toHaveURL('/', { timeout: 15000 });
    await expect(page.getByTestId('logout-btn')).toBeVisible({ timeout: 5000 });
  });

  test('supplier registration flow - full 3-step process', async ({ page }) => {
    const email = `supplier_${Date.now()}@testdefense.com`;

    await page.goto('/supplier-registration', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('step-1')).toBeVisible();

    // Step 1: Fill company info
    await page.getByTestId('company-name').fill('TEST Armored Solutions Inc');
    await page.getByTestId('supplier-type').click();
    await page.getByRole('option', { name: 'Manufacturer' }).click();
    await page.getByTestId('contact-person').fill('TEST Col Johnson');
    await page.getByTestId('email').fill(email);
    await page.getByTestId('phone').fill('+971501234567');
    await page.getByTestId('license-number').fill('LIC-GOLDEN-001');
    await page.getByTestId('next-btn').click({ force: true });

    // Step 2: Documents
    await expect(page.getByTestId('step-2')).toBeVisible();
    // Click a certification option
    await page.getByTestId('cert-iso-9001').click({ force: true });
    await page.getByTestId('next-btn').click({ force: true });

    // Step 3: Review
    await expect(page.getByTestId('step-3')).toBeVisible();
    // Verify company name shows in review
    await expect(page.locator('text=TEST Armored Solutions Inc')).toBeVisible();

    // Submit
    await page.getByTestId('submit-btn').click({ force: true });
    // Should redirect to homepage after successful submission
    await expect(page).toHaveURL('/', { timeout: 15000 });
  });

  test('contact form journey - fill and submit', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('contact-page')).toBeVisible();

    await page.getByTestId('contact-name').fill('TEST Defense Buyer');
    await page.getByTestId('contact-company').fill('TEST Procurement Agency');
    await page.getByTestId('contact-email').fill(`contact_${Date.now()}@testbuyer.com`);
    await page.getByTestId('contact-phone').fill('+971501234567');
    await page.getByTestId('contact-subject').click();
    await page.getByRole('option', { name: 'Procurement Request' }).click();
    await page.getByTestId('contact-message').fill('We are interested in your defense components catalog for upcoming procurement cycle.');

    await page.getByTestId('submit-contact-btn').click({ force: true });
    await expect(page.getByText(/message sent|success/i)).toBeVisible({ timeout: 10000 });
  });
});
