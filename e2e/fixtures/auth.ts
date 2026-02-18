import { Page, expect } from "@playwright/test";
import { Role } from "core/constants/role.ts";

/**
 * Test credentials based on seeded data from server/prisma/seed.ts
 */
export const TEST_USERS = {
  admin: {
    email: "admin@example.com",
    password: "password123",
    name: "Admin",
    role: Role.admin,
  },
  // Currently only admin is seeded, but we can add agent users here if seeded
} as const;

/**
 * Logs in a user with the provided credentials
 */
export async function login(
  page: Page,
  credentials: { email: string; password: string }
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

/**
 * Logs in as the seeded admin user
 */
export async function loginAsAdmin(page: Page) {
  await login(page, TEST_USERS.admin);
  // Wait for redirect to home page after successful login
  await expect(page).toHaveURL("/");
}

/**
 * Logs out the current user
 */
export async function logout(page: Page) {
  await page.getByRole("button", { name: /sign out/i }).click();
  // Wait for redirect to login page
  await expect(page).toHaveURL("/login");
}

/**
 * Checks if the user is on the login page
 */
export async function expectLoginPage(page: Page) {
  await expect(page).toHaveURL("/login");
  await expect(page.getByText("Helpdesk")).toBeVisible();
  await expect(page.getByText(/sign in to your account/i)).toBeVisible();
}

/**
 * Checks if the user is on the home page (authenticated)
 */
export async function expectHomePage(page: Page) {
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
}
