import type { RequestHandler } from "express";
import { Role } from "core/constants/role.ts";

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (req.user?.role !== Role.admin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
};
