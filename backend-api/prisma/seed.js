import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { STATUSES, USER_ROLES } from "../src/constants.js";
const prisma = new PrismaClient();
async function main() {
    const category = await prisma.productCategory.upsert({
        where: { name: "Semiconductor Woven Water Blocking Tape" },
        update: {},
        create: { name: "Semiconductor Woven Water Blocking Tape", status: STATUSES.ACTIVE },
    });
    for (const code of ["CHSCWWBT 18", "CHSCWWBT 20", "CHSCWWBT 22", "CHSCWWBT 25"]) {
        await prisma.productCode.upsert({
            where: { code },
            update: {},
            create: { categoryId: category.id, code, status: STATUSES.ACTIVE },
        });
    }
    for (const company of ["ABC Cables", "Delta Insulation", "Internal Store"]) {
        await prisma.companyClient.upsert({
            where: { name: company },
            update: {},
            create: { name: company, status: STATUSES.ACTIVE },
        });
    }
    const users = [
        { name: "System Super Admin", employeeId: "SA001", username: "superadmin", password: "superadmin123", role: USER_ROLES.SUPER_ADMIN },
        { name: "Plant Manager", employeeId: "ADM001", username: "manager1", password: "manager123", role: USER_ROLES.ADMIN },
        { name: "Worker One", employeeId: "EMP001", username: null, password: "worker123", role: USER_ROLES.WORKER },
    ];
    for (const u of users) {
        const passwordHash = await bcrypt.hash(u.password, 10);
        await prisma.worker.upsert({
            where: { employeeId: u.employeeId },
            update: { passwordHash },
            create: {
                name: u.name,
                employeeId: u.employeeId,
                username: u.username,
                passwordHash,
                role: u.role,
                status: STATUSES.ACTIVE,
            },
        });
    }
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
