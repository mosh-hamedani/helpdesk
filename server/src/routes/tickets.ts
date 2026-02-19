import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import prisma from "../db";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const tickets = await prisma.ticket.findMany({
    select: {
      id: true,
      subject: true,
      status: true,
      category: true,
      senderName: true,
      senderEmail: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ tickets });
});

export default router;
