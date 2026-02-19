import { test, expect } from "@playwright/test";
import type { InboundEmailInput } from "core/schemas/tickets.ts";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!;
const API_BASE_URL = process.env.BETTER_AUTH_URL!;

/**
 * Helper to create a valid inbound email payload
 */
function createValidPayload(
  overrides?: Partial<InboundEmailInput>
): InboundEmailInput {
  const timestamp = Date.now();
  return {
    from: `sender${timestamp}@example.com`,
    fromName: `Test Sender ${timestamp}`,
    subject: `Test Subject ${timestamp}`,
    body: `This is a test email body sent at ${timestamp}`,
    ...overrides,
  };
}

test.describe("Webhook: Inbound Email", () => {
  test.describe("Authentication", () => {
    test("should reject request with missing webhook secret", async ({
      request,
    }) => {
      const payload = createValidPayload();

      const response = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          data: payload,
          failOnStatusCode: false,
        }
      );

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toMatch(/invalid webhook secret/i);
    });

    test("should reject request with wrong webhook secret in header", async ({
      request,
    }) => {
      const payload = createValidPayload();

      const response = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": "wrong-secret",
          },
          data: payload,
          failOnStatusCode: false,
        }
      );

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toMatch(/invalid webhook secret/i);
    });

    test("should reject request with wrong webhook secret in query param", async ({
      request,
    }) => {
      const payload = createValidPayload();

      const response = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email?secret=wrong-secret`,
        {
          data: payload,
          failOnStatusCode: false,
        }
      );

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toMatch(/invalid webhook secret/i);
    });

    test("should accept request with correct webhook secret in header", async ({
      request,
    }) => {
      const payload = createValidPayload();

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
      expect(body).toHaveProperty("ticket");
    });

    test("should accept request with correct webhook secret in query param", async ({
      request,
    }) => {
      const payload = createValidPayload();

      const response = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email?secret=${WEBHOOK_SECRET}`,
        {
          data: payload,
        }
      );

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty("ticket");
    });
  });

  test.describe("Validation", () => {
    test("should reject request with invalid email format", async ({
      request,
    }) => {
      const payload = createValidPayload({ from: "not-an-email" });

      const response = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: payload,
          failOnStatusCode: false,
        }
      );

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toMatch(/invalid email/i);
    });

    test("should reject request with missing email field", async ({
      request,
    }) => {
      const payload = createValidPayload();
      // @ts-expect-error - testing invalid payload
      delete payload.from;

      const response = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: payload,
          failOnStatusCode: false,
        }
      );

      expect(response.status()).toBe(400);
    });

    test("should reject request with empty fromName", async ({ request }) => {
      const payload = createValidPayload({ fromName: "" });

      const response = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: payload,
          failOnStatusCode: false,
        }
      );

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toMatch(/sender name is required/i);
    });

    test("should reject request with whitespace-only fromName", async ({
      request,
    }) => {
      const payload = createValidPayload({ fromName: "   " });

      const response = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: payload,
          failOnStatusCode: false,
        }
      );

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toMatch(/sender name is required/i);
    });

    test("should reject request with empty subject", async ({ request }) => {
      const payload = createValidPayload({ subject: "" });

      const response = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: payload,
          failOnStatusCode: false,
        }
      );

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toMatch(/subject is required/i);
    });

    test("should reject request with whitespace-only subject", async ({
      request,
    }) => {
      const payload = createValidPayload({ subject: "   " });

      const response = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: payload,
          failOnStatusCode: false,
        }
      );

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toMatch(/subject is required/i);
    });

    test("should reject request with empty body", async ({ request }) => {
      const payload = createValidPayload({ body: "" });

      const response = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: payload,
          failOnStatusCode: false,
        }
      );

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toMatch(/body is required/i);
    });

    test("should accept request with missing bodyHtml (optional field)", async ({
      request,
    }) => {
      const payload = createValidPayload();
      // bodyHtml is optional, so don't include it

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
      expect(body.ticket).toBeDefined();
      expect(body.ticket.bodyHtml).toBeNull();
    });
  });

  test.describe("Ticket Creation", () => {
    test("should create a new ticket with valid payload", async ({
      request,
    }) => {
      const timestamp = Date.now();
      const payload = createValidPayload({
        from: `newticket${timestamp}@example.com`,
        fromName: `New Ticket Sender ${timestamp}`,
        subject: `New Ticket Subject ${timestamp}`,
        body: `This is the body of the new ticket ${timestamp}`,
      });

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
      const responseBody = await response.json();

      expect(responseBody).toHaveProperty("ticket");
      const ticket = responseBody.ticket;

      // Verify all fields are correctly set
      expect(ticket.subject).toBe(payload.subject);
      expect(ticket.body).toBe(payload.body);
      expect(ticket.senderName).toBe(payload.fromName);
      expect(ticket.senderEmail).toBe(payload.from);
      expect(ticket.status).toBe("open");
      expect(ticket.category).toBeNull();
      expect(ticket.bodyHtml).toBeNull(); // Not provided in payload

      // Verify ticket has an ID and timestamps
      expect(ticket.id).toBeDefined();
      expect(typeof ticket.id).toBe("number");
      expect(ticket.createdAt).toBeDefined();
      expect(ticket.updatedAt).toBeDefined();
    });

    test("should create ticket with bodyHtml when provided", async ({
      request,
    }) => {
      const timestamp = Date.now();
      const payload = createValidPayload({
        from: `withhtml${timestamp}@example.com`,
        fromName: `HTML Sender ${timestamp}`,
        subject: `HTML Subject ${timestamp}`,
        body: `Plain text body ${timestamp}`,
        bodyHtml: `<p>HTML body ${timestamp}</p>`,
      });

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
      const responseBody = await response.json();

      expect(responseBody.ticket.body).toBe(payload.body);
      expect(responseBody.ticket.bodyHtml).toBe(payload.bodyHtml);
    });
  });

  test.describe("Email Threading", () => {
    test("should thread duplicate email to existing open ticket (same sender + subject)", async ({
      request,
    }) => {
      const timestamp = Date.now();
      const senderEmail = `threading${timestamp}@example.com`;
      const subject = `Threading Test ${timestamp}`;

      // Create first ticket
      const firstPayload = createValidPayload({
        from: senderEmail,
        fromName: "Threading Sender",
        subject: subject,
        body: "First email body",
      });

      const firstResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: firstPayload,
        }
      );

      expect(firstResponse.status()).toBe(201);
      const firstBody = await firstResponse.json();
      const firstTicketId = firstBody.ticket.id;

      // Send second email with same sender and subject
      const secondPayload = createValidPayload({
        from: senderEmail,
        fromName: "Threading Sender",
        subject: subject,
        body: "Second email body (should be threaded)",
      });

      const secondResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: secondPayload,
        }
      );

      // Should return 200 OK (not 201) for threaded email
      expect(secondResponse.status()).toBe(200);
      const secondBody = await secondResponse.json();

      // Should return the same ticket
      expect(secondBody.ticket.id).toBe(firstTicketId);
      expect(secondBody.ticket.subject).toBe(subject);
      expect(secondBody.ticket.senderEmail).toBe(senderEmail);
    });

    test("should thread email with 'Re:' prefix to existing ticket", async ({
      request,
    }) => {
      const timestamp = Date.now();
      const senderEmail = `reprefix${timestamp}@example.com`;
      const baseSubject = `Re Prefix Test ${timestamp}`;

      // Create first ticket with original subject
      const firstPayload = createValidPayload({
        from: senderEmail,
        fromName: "Re Sender",
        subject: baseSubject,
        body: "Original email",
      });

      const firstResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: firstPayload,
        }
      );

      expect(firstResponse.status()).toBe(201);
      const firstBody = await firstResponse.json();
      const firstTicketId = firstBody.ticket.id;

      // Send reply with "Re:" prefix
      const replyPayload = createValidPayload({
        from: senderEmail,
        fromName: "Re Sender",
        subject: `Re: ${baseSubject}`,
        body: "Reply to original email",
      });

      const replyResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: replyPayload,
        }
      );

      // Should thread to existing ticket
      expect(replyResponse.status()).toBe(200);
      const replyBody = await replyResponse.json();
      expect(replyBody.ticket.id).toBe(firstTicketId);
    });

    test("should thread email with 'Fwd:' prefix to existing ticket", async ({
      request,
    }) => {
      const timestamp = Date.now();
      const senderEmail = `fwdprefix${timestamp}@example.com`;
      const baseSubject = `Fwd Prefix Test ${timestamp}`;

      // Create first ticket
      const firstPayload = createValidPayload({
        from: senderEmail,
        fromName: "Fwd Sender",
        subject: baseSubject,
        body: "Original email",
      });

      const firstResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: firstPayload,
        }
      );

      expect(firstResponse.status()).toBe(201);
      const firstBody = await firstResponse.json();
      const firstTicketId = firstBody.ticket.id;

      // Send forward with "Fwd:" prefix
      const forwardPayload = createValidPayload({
        from: senderEmail,
        fromName: "Fwd Sender",
        subject: `Fwd: ${baseSubject}`,
        body: "Forward of original email",
      });

      const forwardResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: forwardPayload,
        }
      );

      // Should thread to existing ticket
      expect(forwardResponse.status()).toBe(200);
      const forwardBody = await forwardResponse.json();
      expect(forwardBody.ticket.id).toBe(firstTicketId);
    });

    test("should thread email with multiple 'Re:' prefixes", async ({
      request,
    }) => {
      const timestamp = Date.now();
      const senderEmail = `multiple${timestamp}@example.com`;
      const baseSubject = `Multiple Prefix Test ${timestamp}`;

      // Create first ticket
      const firstPayload = createValidPayload({
        from: senderEmail,
        subject: baseSubject,
        body: "Original",
      });

      const firstResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: firstPayload,
        }
      );

      expect(firstResponse.status()).toBe(201);
      const firstTicketId = firstResponse.json().then((b) => b.ticket.id);

      // Send email with multiple Re: prefixes
      const replyPayload = createValidPayload({
        from: senderEmail,
        subject: `Re: Re: Re: ${baseSubject}`,
        body: "Multiple replies",
      });

      const replyResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: replyPayload,
        }
      );

      expect(replyResponse.status()).toBe(200);
      const replyBody = await replyResponse.json();
      expect(replyBody.ticket.id).toBe(await firstTicketId);
    });

    test("should thread email with case-insensitive 're:' prefix", async ({
      request,
    }) => {
      const timestamp = Date.now();
      const senderEmail = `caseinsensitive${timestamp}@example.com`;
      const baseSubject = `Case Test ${timestamp}`;

      // Create first ticket
      const firstPayload = createValidPayload({
        from: senderEmail,
        subject: baseSubject,
        body: "Original",
      });

      const firstResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: firstPayload,
        }
      );

      expect(firstResponse.status()).toBe(201);
      const firstTicketId = firstResponse.json().then((b) => b.ticket.id);

      // Test lowercase 're:'
      const lowercasePayload = createValidPayload({
        from: senderEmail,
        subject: `re: ${baseSubject}`,
        body: "Lowercase re",
      });

      const lowercaseResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: lowercasePayload,
        }
      );

      expect(lowercaseResponse.status()).toBe(200);
      expect(
        lowercaseResponse.json().then((b) => b.ticket.id)
      ).resolves.toBe(await firstTicketId);
    });

    test("should NOT thread if sender is different (even with same subject)", async ({
      request,
    }) => {
      const timestamp = Date.now();
      const baseSubject = `Different Sender Test ${timestamp}`;

      // Create first ticket from sender A
      const firstPayload = createValidPayload({
        from: `sender-a-${timestamp}@example.com`,
        subject: baseSubject,
        body: "Email from sender A",
      });

      const firstResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: firstPayload,
        }
      );

      expect(firstResponse.status()).toBe(201);
      const firstBody = await firstResponse.json();
      const firstTicketId = firstBody.ticket.id;

      // Send email from sender B with same subject
      const secondPayload = createValidPayload({
        from: `sender-b-${timestamp}@example.com`,
        subject: baseSubject,
        body: "Email from sender B",
      });

      const secondResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: secondPayload,
        }
      );

      // Should create a NEW ticket (201, not 200)
      expect(secondResponse.status()).toBe(201);
      const secondBody = await secondResponse.json();

      // Should have different ticket ID
      expect(secondBody.ticket.id).not.toBe(firstTicketId);
    });

    test("should NOT thread if subject is different (even with same sender)", async ({
      request,
    }) => {
      const timestamp = Date.now();
      const senderEmail = `samesender${timestamp}@example.com`;

      // Create first ticket with subject A
      const firstPayload = createValidPayload({
        from: senderEmail,
        subject: `Subject A ${timestamp}`,
        body: "First email",
      });

      const firstResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: firstPayload,
        }
      );

      expect(firstResponse.status()).toBe(201);
      const firstBody = await firstResponse.json();
      const firstTicketId = firstBody.ticket.id;

      // Send email from same sender with different subject
      const secondPayload = createValidPayload({
        from: senderEmail,
        subject: `Subject B ${timestamp}`,
        body: "Second email with different subject",
      });

      const secondResponse = await request.post(
        `${API_BASE_URL}/api/webhooks/inbound-email`,
        {
          headers: {
            "x-webhook-secret": WEBHOOK_SECRET,
          },
          data: secondPayload,
        }
      );

      // Should create a NEW ticket
      expect(secondResponse.status()).toBe(201);
      const secondBody = await secondResponse.json();
      expect(secondBody.ticket.id).not.toBe(firstTicketId);
    });
  });
});
