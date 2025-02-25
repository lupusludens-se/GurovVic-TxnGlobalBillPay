import { test, expect } from '@playwright/test';

test('Login page functionality', async ({ page }) => {
  // Define reusable locators
  const emailField = page.getByRole('textbox', { name: 'Email address' });
  const submitButton = page.getByRole('button', { name: 'Submit' });
  const passwordField = page.getByRole('textbox', { name: 'Password' });

  // Navigate to login page
  await page.goto('https://billpay-dev.resourceadvisor.schneider-electric.com/Login/');
  await page.getByRole('img', { name: 'CardSecure' }).click();

  // Initial login page checks
  await expect(page.getByRole('heading')).toContainText('Enter your email');
  await expect(page.getByRole('paragraph')).toContainText('Use your email to begin payment');
  await expect(page.locator('form')).toContainText('Email address');
  await expect(submitButton).toBeVisible();
  await expect(emailField).toBeEmpty();

  // Test with invalid email
  await emailField.click({ button: 'right' });
  await emailField.fill('wrong_automationacc3@yopmail.com');
  await submitButton.click();
  await page.locator("text=You are not a current customer. Please reach out to our administrator to sign up");

  // Test with valid email
  await emailField.click({ button: 'right' });
  await emailField.press('ControlOrMeta+a');
  await emailField.click({ button: 'right' });
  await emailField.fill('automationacc3@yopmail.com');
  await submitButton.click();

  // Password page checks
  await expect(page.locator('form')).toContainText('Password');
  await expect(passwordField).toBeEmpty({ timeout: 5000 });

  // Test with invalid password
  await passwordField.click({ button: 'right' });
  await passwordField.fill('invalid_password');
  await submitButton.click();
  await page.locator("text=The password entered is incorrect.");

  // Test with valid password
  await passwordField.click({ button: 'right' });
  await passwordField.fill('ea249415ed78e2f2c53959dbd0f9c590e872049895c7ede7f146d0221d24f4e78dad21bc2b1b4f0c42112ff05aa9f503429dc3e0b425de5c1142a06d27ec0c57daacc3701ebb8e1ab8886a370d11666b78eed2fc8cfa733c061d83dc5632b9d6baddae9a3515f5562bb8b5ebf41d6e663f509d63f6db4f86bb8f74a884df0721');
  await passwordField.press('Enter');

  // Dashboard checks
  await expect(page.locator('h2')).toContainText('Dashboard');
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  await page.getByRole('link', { name: 'Pending Transactions' }).click();
  await expect(page.getByRole('heading', { name: 'Pending Transactions' })).toBeVisible();
  await page.getByRole('link', { name: 'Completed Transactions' }).click();
  await expect(page.getByRole('heading', { name: 'Completed Transactions' })).toBeVisible();
  await page.getByRole('link', { name: 'View Payments' }).click();
  await expect(page.getByRole('heading', { name: 'Payment History' })).toBeVisible();
  await page.getByRole('button', { name: 'Bank Accounts' }).click();
  await expect(page.getByRole('link', { name: 'My Bank Accounts' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Add Bank Account' })).toBeVisible();
  await page.getByRole('button', { name: 'User Options' }).click();
  await expect(page.getByRole('link', { name: 'Edit My Info' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign Out' })).toBeVisible();

  // Sign out
  await page.getByRole('link', { name: 'Sign Out' }).click();
  await expect(page.getByRole('heading')).toContainText('Are you sure you would like to sign out?');
  await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByRole('heading')).toContainText('Enter your email');
});