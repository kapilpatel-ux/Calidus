import { test, expect } from '@playwright/test';
import { dismissToasts, removeEmergentBadge } from '../fixtures/helpers';

const BASE = 'https://connect-preview-4.preview.emergentagent.com';

// Helper to generate unique email
function uniqueEmail() {
  return `test_${Date.now()}@testdefense.com`;
}

test.describe('Product & Supplier Detail Pages', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('product page loads with title and details', async ({ page }) => {
    await page.goto('/product/rocket-launcher-m270-mlrs', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('product-page')).toBeVisible();
    await expect(page.getByTestId('product-title')).toBeVisible();
  });

  test('product page has contact supplier button', async ({ page }) => {
    await page.goto('/product/rocket-launcher-m270-mlrs', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('product-page')).toBeVisible();
    await expect(page.getByTestId('contact-supplier-btn')).toBeVisible();
  });

  test('product page contact supplier modal opens', async ({ page }) => {
    await page.goto('/product/rocket-launcher-m270-mlrs', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('contact-supplier-btn')).toBeVisible();
    await page.getByTestId('contact-supplier-btn').click({ force: true });
    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Contact Supplier' })).toBeVisible();
  });

  test('product page has tabs: Overview, Technical Specs, Applications', async ({ page }) => {
    await page.goto('/product/rocket-launcher-m270-mlrs', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('product-page')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Technical Specs' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Applications' })).toBeVisible();
  });

  test('product page specifications section visible in Technical Specs tab', async ({ page }) => {
    await page.goto('/product/rocket-launcher-m270-mlrs', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('product-page')).toBeVisible();
    // Specs are in the "Technical Specs" tab - click it first
    await page.getByRole('tab', { name: 'Technical Specs' }).click();
    await expect(page.getByTestId('product-specs')).toBeVisible();
    await expect(page.getByTestId('product-specs')).toContainText('TECHNICAL SPECIFICATIONS');
  });

  test('product page Applications tab shows content', async ({ page }) => {
    await page.goto('/product/rocket-launcher-m270-mlrs', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('product-page')).toBeVisible();
    await page.getByRole('tab', { name: 'Applications' }).click();
    await expect(page.locator('body')).toContainText(/APPLICATION AREAS/i);
  });

  test('product page has supplier snapshot section', async ({ page }) => {
    await page.goto('/product/rocket-launcher-m270-mlrs', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('product-page')).toBeVisible();
    await expect(page.locator('body')).toContainText(/SUPPLIER SNAPSHOT/i);
    await expect(page.getByTestId('view-supplier-profile-btn')).toBeVisible({ timeout: 10000 });
  });

  test('supplier page loads with trust indicators', async ({ page }) => {
    await page.goto('/supplier/sentinel-defense-systems', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('supplier-page')).toBeVisible();
    await expect(page.getByTestId('supplier-title')).toBeVisible();
    await expect(page.getByTestId('supplier-title')).toContainText('SENTINEL');
    // Trust indicators: years of experience, active products, countries served
    await expect(page.locator('body')).toContainText(/Years Experience|years/i);
    await expect(page.locator('body')).toContainText(/Active Products|Countries Served/i);
  });

  test('supplier page has profile completeness meter', async ({ page }) => {
    await page.goto('/supplier/sentinel-defense-systems', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('supplier-page')).toBeVisible();
    // Profile completeness section
    await expect(page.locator('body')).toContainText(/Profile Completeness/i);
    await expect(page.locator('body')).toContainText(/Profile Score/i);
  });

  test('supplier page has contact button', async ({ page }) => {
    await page.goto('/supplier/sentinel-defense-systems', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('supplier-page')).toBeVisible();
    await expect(page.getByTestId('contact-supplier-btn')).toBeVisible();
  });

  test('supplier page contact modal opens', async ({ page }) => {
    await page.goto('/supplier/sentinel-defense-systems', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('contact-supplier-btn').click({ force: true });
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Contact Sentinel/i })).toBeVisible();
  });

  test('suppliers listing page shows supplier cards', async ({ page }) => {
    await page.goto('/suppliers', { waitUntil: 'domcontentloaded' });
    // Page should load with supplier cards
    const supplierLinks = page.locator('a[href*="/supplier/"]');
    await expect(supplierLinks.first()).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Enhanced Search & Category Features', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('search empty state shows "No Direct Match Found" with expert CTA', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const navSearch = page.getByTestId('navbar').getByTestId('search-input');
    // Search for something very unlikely to match
    await navSearch.fill('xyzquantumdefense9999abcnomatch');
    await expect(page.getByTestId('navbar').getByTestId('search-suggestions')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('navbar').getByTestId('search-suggestions')).toContainText(/No Direct Match Found/i);
    // Expert CTA link
    await expect(page.getByTestId('navbar').getByText(/Speak to Our Experts/i)).toBeVisible();
  });

  test('category page enhanced filters: subcategory and availability', async ({ page }) => {
    await page.goto('/category/electronics', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('category-page')).toBeVisible();
    await expect(page.getByTestId('filters-sidebar')).toBeVisible();
    // Availability filter exists
    await expect(page.getByTestId('filter-in-stock')).toBeVisible();
    // Rating filter exists
    await expect(page.getByTestId('filter-rating-4')).toBeVisible();
  });

  test('category page filter: apply rating and clear', async ({ page }) => {
    await page.goto('/category/electronics', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('category-page')).toBeVisible();
    // Apply filter
    await page.getByTestId('filter-rating-4').click({ force: true });
    // Clear button appears
    await expect(page.getByTestId('clear-filters-btn')).toBeVisible();
    // Click clear
    await page.getByTestId('clear-filters-btn').click({ force: true });
    // Clear button disappears (no active filters)
    await expect(page.getByTestId('clear-filters-btn')).not.toBeVisible();
  });

  test('category page shows product count and sort control', async ({ page }) => {
    await page.goto('/category/armored-systems', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('category-page')).toBeVisible();
    await expect(page.getByTestId('sort-select')).toBeVisible();
    await expect(page.locator('body')).toContainText(/products found/i);
  });
});

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('contact page loads with form', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('contact-page')).toBeVisible();
    await expect(page.getByTestId('contact-name')).toBeVisible();
    await expect(page.getByTestId('contact-email')).toBeVisible();
    await expect(page.getByTestId('contact-message')).toBeVisible();
    await expect(page.getByTestId('submit-contact-btn')).toBeVisible();
  });

  test('contact form submits successfully', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    const email = uniqueEmail();

    await page.getByTestId('contact-name').fill('TEST John Smith');
    await page.getByTestId('contact-company').fill('TEST Defense Corp');
    await page.getByTestId('contact-email').fill(email);
    await page.getByTestId('contact-phone').fill('+971501234567');

    // Select subject via shadcn Select component
    await page.getByTestId('contact-subject').click();
    await page.getByRole('option', { name: 'General Inquiry' }).click();

    await page.getByTestId('contact-message').fill('This is a test inquiry message from regression testing.');
    await page.getByTestId('submit-contact-btn').click({ force: true });

    // Should show success toast or clear form
    await expect(page.getByText(/message sent|success/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Supplier Registration Multi-Step Form', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('supplier registration page loads with step 1', async ({ page }) => {
    await page.goto('/supplier-registration', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('supplier-registration-page')).toBeVisible();
    await expect(page.getByTestId('page-title')).toBeVisible();
    await expect(page.getByTestId('step-1')).toBeVisible();
    await expect(page.getByTestId('company-name')).toBeVisible();
  });

  test('supplier registration step 1 validation', async ({ page }) => {
    await page.goto('/supplier-registration', { waitUntil: 'domcontentloaded' });
    // Click next without filling required fields
    await page.getByTestId('next-btn').click({ force: true });
    // Should show error toast
    await expect(page.getByText(/fill in all required fields/i)).toBeVisible({ timeout: 5000 });
  });

  test('supplier registration advances to step 2', async ({ page }) => {
    await page.goto('/supplier-registration', { waitUntil: 'domcontentloaded' });

    await page.getByTestId('company-name').fill('TEST Defense Supplier Co');
    
    // Select supplier type
    await page.getByTestId('supplier-type').click();
    await page.getByRole('option', { name: 'Manufacturer' }).click();

    await page.getByTestId('contact-person').fill('TEST Jane Smith');
    await page.getByTestId('email').fill(uniqueEmail());
    await page.getByTestId('phone').fill('+971501234567');
    await page.getByTestId('license-number').fill('LIC-TEST-001');

    await page.getByTestId('next-btn').click({ force: true });
    
    // Should advance to step 2
    await expect(page.getByTestId('step-2')).toBeVisible({ timeout: 5000 });
  });

  test('supplier registration back button works', async ({ page }) => {
    await page.goto('/supplier-registration', { waitUntil: 'domcontentloaded' });

    await page.getByTestId('company-name').fill('TEST Defense Supplier Co');
    await page.getByTestId('supplier-type').click();
    await page.getByRole('option', { name: 'Distributor' }).click();
    await page.getByTestId('contact-person').fill('TEST Contact');
    await page.getByTestId('email').fill(uniqueEmail());
    await page.getByTestId('phone').fill('+971501234567');
    await page.getByTestId('license-number').fill('LIC-TEST-002');
    
    // Wait for form to be ready before clicking next
    await expect(page.getByTestId('license-number')).toHaveValue('LIC-TEST-002');
    await page.getByTestId('next-btn').click({ force: true });

    await expect(page.getByTestId('step-2')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('back-btn').click({ force: true });
    await expect(page.getByTestId('step-1')).toBeVisible();
  });
});

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('login page loads with form', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('login-email').fill('nonexistent@test.com');
    await page.getByTestId('login-password').fill('wrongpassword');
    await page.getByTestId('login-submit').click({ force: true });
    await expect(page.getByText(/invalid credentials|login failed/i)).toBeVisible({ timeout: 10000 });
  });

  test('register page loads with form', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('register-page')).toBeVisible();
    await expect(page.getByTestId('register-name')).toBeVisible();
    await expect(page.getByTestId('register-email')).toBeVisible();
    await expect(page.getByTestId('register-password')).toBeVisible();
    await expect(page.getByTestId('register-submit')).toBeVisible();
  });

  test('user registration works and redirects to homepage', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    const email = uniqueEmail();

    await page.getByTestId('register-name').fill('TEST User Defense');
    await page.getByTestId('register-company').fill('TEST Corp');
    await page.getByTestId('register-email').fill(email);
    await page.getByTestId('register-password').fill('SecurePass123!');
    await page.getByTestId('register-submit').click({ force: true });

    // Should redirect to homepage after registration
    await expect(page).toHaveURL('/', { timeout: 15000 });
  });

  test('user can login with registered credentials', async ({ page }) => {
    const email = uniqueEmail();
    
    // Register first via API to avoid test dependency
    await page.request.post(`${BASE}/api/auth/register`, {
      data: {
        email: email,
        full_name: 'TEST Login User',
        password: 'TestPass456!',
        user_type: 'buyer'
      }
    });

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill('TestPass456!');
    await page.getByTestId('login-submit').click({ force: true });

    // Should redirect to homepage
    await expect(page).toHaveURL('/', { timeout: 15000 });
    // Should show user name / logout in navbar
    await expect(page.getByTestId('logout-btn')).toBeVisible({ timeout: 5000 });
  });
});
