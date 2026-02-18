import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../utils/prisma.js";

const router = Router();
router.use(requireAuth);

router.get("/master", async (_req, res) => {
  const categories = await prisma.productCategory.findMany({
    where: { status: "ACTIVE" },
    include: { codes: { where: { status: "ACTIVE" } } },
    orderBy: { name: "asc" },
  });

  const companies = await prisma.companyClient.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });

  res.json({ categories, companies });
});

export default router;
