import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../fixtures/auth";
import type { InboundEmailInput } from "core/schemas/tickets.ts";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!;
const API_BASE_URL = process.env.BETTER_AUTH_URL!;

/**
 * Helper to create a ticket via the inbound email webhook
 */
async function createTicketViaWebhook(
  request: any,
  payload: Partial<InboundEmailInput> & { from: string; fromName: string; subject: string; body: string }
) {
  const response = await request.post(
    `${API_BASE_URL}/api/webhooks/inbound-email`,
    {
      headers: {
        "x-webhook-secret": WEBHOOK_SECRET,
      },
      data: payload,
    }
  );

  expect(response.status()).toBe(201);
  const body = await response.json();
  return body.ticket;
}

/**
 * Helper to create a unique test payload
 */
function createTestPayload(uniqueId: string, overrides?: Partial<InboundEmailInput>): InboundEmailInput {
  return {
    from: `sender-${uniqueId}@example.com`,
    fromName: `Test Sender ${uniqueId}`,
    subject: `Test Subject ${uniqueId}`,
    body: `Test body ${uniqueId}`,
    ...overrides,
  };
}

test.describe("Tickets Page", () => {
  test.describe("Navigation", () => {
    test("should show 'Tickets' link in navigation for authenticated user", async ({ page }) => {
      await loginAsAdmin(page);

      const ticketsLink = page.getByRole("link", { name: /^tickets$/i });
      await expect(ticketsLink).toBeVisible();
    });

    test("should navigate to /tickets when clicking Tickets link", async ({ page }) => {
      await loginAsAdmin(page);

      await page.getByRole("link", { name: /^tickets$/i }).click();

      await expect(page).toHaveURL("/tickets");
      await expect(page.getByRole("heading", { name: /^tickets$/i })).toBeVisible();
    });

    test("should redirect to login when accessing /tickets without authentication", async ({ page }) => {
      await page.goto("/tickets");

      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Integration with Webhook", () => {
    test("should display ticket created via webhook endpoint", async ({ page, request }) => {
      const uniqueId = `webhook-${Date.now()}`;
      const payload = createTestPayload(uniqueId);

      const ticket = await createTicketViaWebhook(request, payload);

      await loginAsAdmin(page);
      await page.goto("/tickets");

      const row = page.getByRole("row").filter({ hasText: ticket.subject });
      await expect(row).toBeVisible();
      await expect(row.getByText(payload.fromName)).toBeVisible();
      await expect(row.getByText(payload.from)).toBeVisible();
      await expect(row.locator("text=open").first()).toBeVisible();
    });

    test("should show newly created ticket after page reload", async ({ page, request }) => {
      await loginAsAdmin(page);
      await page.goto("/tickets");

      const uniqueId = `refresh-${Date.now()}`;
      const payload = createTestPayload(uniqueId);
      const ticket = await createTicketViaWebhook(request, payload);

      await page.reload();

      await expect(page.getByText(ticket.subject)).toBeVisible();
    });
  });
});
