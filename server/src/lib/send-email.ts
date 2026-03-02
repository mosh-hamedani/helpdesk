import sgMail from "@sendgrid/mail";
import type { PgBoss } from "pg-boss";

const QUEUE_NAME = "send-email";

interface SendEmailJobData {
  to: string;
  subject: string;
  body: string;
  bodyHtml?: string;
}

export async function registerSendEmailWorker(boss: PgBoss): Promise<void> {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 3,
    retryDelay: 30,
    retryBackoff: true,
  });

  await boss.work<SendEmailJobData>(QUEUE_NAME, async (jobs) => {
    const { to, subject, body, bodyHtml } = jobs[0]!.data;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      text: body,
      ...(bodyHtml && { html: bodyHtml }),
    });

    console.log(`Email sent to ${to} — subject: "${subject}"`);
  });
}

export async function sendEmailJob(data: SendEmailJobData): Promise<void> {
  const { boss } = await import("./queue");
  await boss.send(QUEUE_NAME, data);
}
