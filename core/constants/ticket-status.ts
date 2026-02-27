export const ticketStatuses = ["new", "processing", "open", "resolved", "closed"] as const;

export type TicketStatus = (typeof ticketStatuses)[number];

export const agentTicketStatuses = ["open", "resolved", "closed"] as const;

export type AgentTicketStatus = (typeof agentTicketStatuses)[number];

export const statusLabel: Record<TicketStatus, string> = {
  new: "New",
  processing: "Processing",
  open: "Open",
  resolved: "Resolved",
  closed: "Closed",
};

export const statusVariant: Record<TicketStatus, "default" | "secondary" | "outline"> = {
  new: "outline",
  processing: "outline",
  open: "default",
  resolved: "secondary",
  closed: "outline",
};
