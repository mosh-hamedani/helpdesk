export const Role = {
  admin: "admin",
  agent: "agent",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
