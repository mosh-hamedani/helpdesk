import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import prisma from "../db";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const agents = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  res.json({ agents });
});

export default router;
