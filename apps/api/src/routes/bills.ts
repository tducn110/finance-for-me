// apps/api/src/routes/bills.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertBillSchema, updateBillSchema, insertBillPaymentSchema } from "@finance/shared-schemas";
import { getActiveBills, payBill, deleteBill, getBillPaymentStatus } from "../services/bill-service";
import { db, bills } from "@finance/db";
import { eq, and, isNull } from "drizzle-orm";
import { ok, created, err } from "../lib/response";

export const billRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/", async (c) => ok(c, await getActiveBills(c.get("userId"))))

  .post("/", zValidator("json", insertBillSchema), async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const [result] = await db.insert(bills).values({ userId, ...input });
    const id = String((result as any).insertId);
    const [bill] = await db.select().from(bills).where(eq(bills.id, id)).limit(1);
    return created(c, bill);
  })

  .put("/:id", zValidator("json", updateBillSchema), async (c) => {
    const { id } = c.req.param();
    const userId = c.get("userId");
    const [existing] = await db.select().from(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId), isNull(bills.deletedAt))).limit(1);
    if (!existing) return err(c, 404, "NOT_FOUND", "Hóa đơn không tồn tại");
    await db.update(bills).set({ ...c.req.valid("json"), updatedAt: new Date() }).where(eq(bills.id, id));
    const [updated] = await db.select().from(bills).where(eq(bills.id, id)).limit(1);
    return ok(c, updated);
  })

  .patch("/:id/pay", zValidator("json", insertBillPaymentSchema), async (c) => {
    try {
      const payment = await payBill(c.get("userId"), c.req.valid("json"));
      return ok(c, payment);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      if (e.code === "ALREADY_PAID") return err(c, 409, "ALREADY_PAID", e.message);
      throw e;
    }
  })

  .delete("/:id", async (c) => {
    try {
      await deleteBill(c.get("userId"), c.req.param("id"));
      return ok(c, { message: "Đã xóa hóa đơn" });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  });
