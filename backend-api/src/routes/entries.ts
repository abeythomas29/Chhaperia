import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { prisma } from "../utils/prisma.js";
import { SYNC_STATUSES, UNITS, USER_ROLES } from "../constants.js";

const router = Router();
router.use(requireAuth);

const unitSchema = z.enum([UNITS.METER, UNITS.SQM]);
const syncStatusSchema = z.enum([SYNC_STATUSES.PENDING, SYNC_STATUSES.SYNCED, SYNC_STATUSES.FAILED]);

const entrySchema = z.object({
  productCodeId: z.string(),
  date: z.string(),
  rollsCount: z.number().int().positive(),
  unit: unitSchema,
  quantityPerRoll: z.number().positive(),
  issuedToCompanyId: z.string(),
  sourceDeviceId: z.string().optional(),
  syncStatus: syncStatusSchema.optional(),
});

router.post("/", requireRole(USER_ROLES.WORKER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), async (req, res) => {
  const parsed = entrySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const data = parsed.data;
  const totalQuantity = data.rollsCount * data.quantityPerRoll;

  const created = await prisma.productionEntry.create({
    data: {
      productCodeId: data.productCodeId,
      date: new Date(data.date),
      workerId: req.user.id,
      rollsCount: data.rollsCount,
      unit: data.unit,
      quantityPerRoll: data.quantityPerRoll,
      totalQuantity,
      issuedToCompanyId: data.issuedToCompanyId,
      sourceDeviceId: data.sourceDeviceId,
      syncStatus: data.syncStatus ?? SYNC_STATUSES.SYNCED,
    },
    include: {
      productCode: true,
      issuedToCompany: true,
    },
  });

  res.status(201).json(created);
});

router.post("/sync-batch", requireRole(USER_ROLES.WORKER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), async (req, res) => {
  const payload = z.object({ entries: z.array(entrySchema) }).safeParse(req.body);
  if (!payload.success) return res.status(400).json(payload.error.flatten());
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const results = [];

  for (const e of payload.data.entries) {
    const totalQuantity = e.rollsCount * e.quantityPerRoll;
    const created = await prisma.productionEntry.create({
      data: {
        productCodeId: e.productCodeId,
        date: new Date(e.date),
        workerId: req.user.id,
        rollsCount: e.rollsCount,
        unit: e.unit,
        quantityPerRoll: e.quantityPerRoll,
        totalQuantity,
        issuedToCompanyId: e.issuedToCompanyId,
        sourceDeviceId: e.sourceDeviceId,
        syncStatus: SYNC_STATUSES.SYNCED,
      },
    });
    results.push({ localRef: e.sourceDeviceId ?? null, serverId: created.id, status: "SYNCED" });
  }

  res.json({ synced: results.length, results });
});

router.get("/mine", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const entries = await prisma.productionEntry.findMany({
    where: { workerId: req.user.id },
    include: { productCode: true, issuedToCompany: true },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  res.json(entries);
});

export default router;
