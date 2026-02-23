import { z } from "zod/v4";
import { ticketStatuses } from "../constants/ticket-status.ts";
import { ticketCategories } from "../constants/ticket-category.ts";

export const inboundEmailSchema = z.object({
  from: z.email("Invalid email address"),
  fromName: z.string().trim().min(1, "Sender name is required"),
  subject: z.string().trim().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  bodyHtml: z.string().optional(),
});

export type InboundEmailInput = z.infer<typeof inboundEmailSchema>;

const sortableColumns = [
  "subject",
  "senderName",
  "status",
  "category",
  "createdAt",
] as const;

export type TicketSortField = (typeof sortableColumns)[number];

export const ticketListQuerySchema = z.object({
  sortBy: z.enum(sortableColumns).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(ticketStatuses).optional(),
  category: z.enum(ticketCategories).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
