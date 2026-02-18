import { Router } from "express";
import { stringify } from "csv-stringify/sync";
import dayjs from "dayjs";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { prisma } from "../utils/prisma.js";
import { STATUSES, USER_ROLES } from "../constants.js";

const router = Router();
const statusSchema = z.enum([STATUSES.ACTIVE, STATUSES.INACTIVE]);
const userRoleSchema = z.enum([USER_ROLES.WORKER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]);
router.use(requireAuth, requireRole(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.get("/dashboard", async (_req, res) => {
  const todayStart = dayjs().startOf("day").toDate();
  const weekStart = dayjs().startOf("week").toDate();
  const monthStart = dayjs().startOf("month").toDate();

  const [todayRolls, weeklyRolls, monthlyRolls, byCode, byCompany] = await Promise.all([
    prisma.productionEntry.aggregate({ where: { date: { gte: todayStart } }, _sum: { rollsCount: true } }),
    prisma.productionEntry.aggregate({ where: { date: { gte: weekStart } }, _sum: { rollsCount: true } }),
    prisma.productionEntry.aggregate({ where: { date: { gte: monthStart } }, _sum: { rollsCount: true } }),
    prisma.productionEntry.groupBy({ by: ["productCodeId"], _sum: { totalQuantity: true } }),
    prisma.productionEntry.groupBy({ by: ["issuedToCompanyId"], _sum: { totalQuantity: true } }),
  ]);

  const codeMap = new Map((await prisma.productCode.findMany()).map((c) => [c.id, c.code]));
  const companyMap = new Map((await prisma.companyClient.findMany()).map((c) => [c.id, c.name]));

  res.json({
    rolls: {
      today: todayRolls._sum.rollsCount ?? 0,
      weekly: weeklyRolls._sum.rollsCount ?? 0,
      monthly: monthlyRolls._sum.rollsCount ?? 0,
    },
    productionByCode: byCode.map((b) => ({ code: codeMap.get(b.productCodeId) ?? b.productCodeId, totalQuantity: b._sum.totalQuantity ?? 0 })),
    issuedByCompany: byCompany.map((b) => ({ company: companyMap.get(b.issuedToCompanyId) ?? b.issuedToCompanyId, totalQuantity: b._sum.totalQuantity ?? 0 })),
  });
});

router.get("/logs", async (req, res) => {
  const query = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    productCodeId: z.string().optional(),
    issuedToCompanyId: z.string().optional(),
    workerId: z.string().optional(),
  }).safeParse(req.query);

  if (!query.success) return res.status(400).json(query.error.flatten());

  const { from, to, productCodeId, issuedToCompanyId, workerId } = query.data;

  const where = {
    date: {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    },
    productCodeId,
    issuedToCompanyId,
    workerId,
  };

  const logs = await prisma.productionEntry.findMany({
    where,
    include: { productCode: true, worker: true, issuedToCompany: true },
    orderBy: { timestamp: "desc" },
    take: 1000,
  });

  res.json(logs);
});

router.get("/logs/export", async (req, res) => {
  const query = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    productCodeId: z.string().optional(),
    issuedToCompanyId: z.string().optional(),
    workerId: z.string().optional(),
  }).safeParse(req.query);

  if (!query.success) return res.status(400).json(query.error.flatten());

  const { from, to, productCodeId, issuedToCompanyId, workerId } = query.data;
  const where = {
    date: {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    },
    productCodeId,
    issuedToCompanyId,
    workerId,
  };

  const entries = await prisma.productionEntry.findMany({
    where,
    include: { productCode: true, worker: true, issuedToCompany: true },
    orderBy: { timestamp: "desc" },
    take: 5000,
  });

  const records = entries.map((e) => ({
    id: e.id,
    date: dayjs(e.date).format("YYYY-MM-DD"),
    productCode: e.productCode.code,
    worker: `${e.worker.name} (${e.worker.employeeId})`,
    rollsCount: e.rollsCount,
    unit: e.unit,
    quantityPerRoll: e.quantityPerRoll,
    totalQuantity: e.totalQuantity,
    issuedToCompany: e.issuedToCompany.name,
    timestamp: dayjs(e.timestamp).format("YYYY-MM-DD HH:mm:ss"),
  }));

  const csv = stringify(records, { header: true });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=production-log-${dayjs().format("YYYYMMDD-HHmm")}.csv`);
  res.send(csv);
});

router.get("/products", async (_req, res) => {
  const categories = await prisma.productCategory.findMany({ include: { codes: true }, orderBy: { name: "asc" } });
  res.json(categories);
});

router.post("/products/category", requireRole(USER_ROLES.SUPER_ADMIN), async (req, res) => {
  const parsed = z.object({ name: z.string().min(2) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const created = await prisma.productCategory.create({ data: { name: parsed.data.name, status: STATUSES.ACTIVE } });
  res.status(201).json(created);
});

router.post("/products/code", requireRole(USER_ROLES.SUPER_ADMIN), async (req, res) => {
  const parsed = z.object({ categoryId: z.string(), code: z.string(), description: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const created = await prisma.productCode.create({
    data: {
      categoryId: parsed.data.categoryId,
      code: parsed.data.code,
      description: parsed.data.description,
      status: STATUSES.ACTIVE,
    },
  });

  res.status(201).json(created);
});

router.patch("/products/code/:id/status", requireRole(USER_ROLES.SUPER_ADMIN), async (req, res) => {
  const parsed = z.object({ status: statusSchema }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const updated = await prisma.productCode.update({
    where: { id: String(req.params.id) },
    data: { status: String(parsed.data.status) },
  });
  res.json(updated);
});

router.get("/users", requireRole(USER_ROLES.SUPER_ADMIN), async (_req, res) => {
  const users = await prisma.worker.findMany({ orderBy: { createdAt: "desc" } });
  res.json(users);
});

router.post("/users", requireRole(USER_ROLES.SUPER_ADMIN), async (req, res) => {
  const parsed = z.object({
    name: z.string().min(2),
    employeeId: z.string().min(2),
    username: z.string().optional(),
    password: z.string().min(6),
    role: userRoleSchema,
  }).safeParse(req.body);

  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const created = await prisma.worker.create({
    data: {
      name: parsed.data.name,
      employeeId: parsed.data.employeeId,
      username: parsed.data.username,
      passwordHash,
      role: parsed.data.role,
      status: STATUSES.ACTIVE,
    },
  });

  res.status(201).json(created);
});

router.patch("/users/:id/status", requireRole(USER_ROLES.SUPER_ADMIN), async (req, res) => {
  const parsed = z.object({ status: statusSchema }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const updated = await prisma.worker.update({
    where: { id: String(req.params.id) },
    data: { status: String(parsed.data.status) },
  });
  res.json(updated);
});

export default router;
