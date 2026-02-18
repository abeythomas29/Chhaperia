import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../utils/prisma.js";
import { signToken } from "../utils/jwt.js";
import { UserRole, USER_ROLES } from "../constants.js";

const router = Router();

const schema = z.object({
  identity: z.string().min(1),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { identity, password } = parsed.data;

  const worker = await prisma.worker.findFirst({
    where: {
      status: "ACTIVE",
      OR: [{ employeeId: identity }, { username: identity }],
    },
  });

  if (!worker) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, worker.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const role = worker.role as UserRole;
  if (!Object.values(USER_ROLES).includes(role)) {
    return res.status(403).json({ message: "Invalid role assigned to user" });
  }

  const token = signToken({
    id: worker.id,
    role,
    employeeId: worker.employeeId,
    name: worker.name,
  });

  return res.json({
    token,
    user: {
      id: worker.id,
      role,
      employeeId: worker.employeeId,
      name: worker.name,
    },
  });
});

export default router;
