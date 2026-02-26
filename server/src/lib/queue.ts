import { PgBoss } from "pg-boss";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  ticketCategories,
  type TicketCategory,
} from "core/constants/ticket-category.ts";
import prisma from "../db";

const QUEUE_NAME = "classify-ticket";

const boss = new PgBoss({
  connectionString: process.env.DATABASE_URL!,
});

boss.on("error", console.error);

interface ClassifyJobData {
  ticketId: number;
  subject: string;
  body: string;
}

export async function startQueue(): Promise<void> {
  await boss.start();

  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 3,
    retryDelay: 30,
    retryBackoff: true,
  });

  await boss.work<ClassifyJobData>(QUEUE_NAME, async (jobs) => {
    const { ticketId, subject, body } = jobs[0]!.data;

    const { text } = await generateText({
      model: openai("gpt-5-nano"),
      system:
        "You are a support ticket classifier. " +
        "Classify the ticket into exactly one of these categories: " +
        `${ticketCategories.join(", ")}. ` +
        "Return only the category value with no extra text.",
      prompt: `Subject: ${subject}\n\nBody: ${body}`,
    });

    const category = text.trim() as TicketCategory;

    if (!ticketCategories.includes(category)) {
      console.warn(
        `Invalid category "${text.trim()}" returned for ticket ${ticketId}`
      );
      return;
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { category },
    });
  });

  console.log("Job queue started");
}

export async function stopQueue(): Promise<void> {
  await boss.stop({ graceful: true, timeout: 30000 });
}

export async function sendClassifyJob(ticket: {
  id: number;
  subject: string;
  body: string;
}): Promise<void> {
  await boss.send(QUEUE_NAME, {
    ticketId: ticket.id,
    subject: ticket.subject,
    body: ticket.body,
  });
}
