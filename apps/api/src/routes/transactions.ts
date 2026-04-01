// apps/api/src/routes/transactions.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertTransactionSchema, updateTransactionSchema } from "@finance/shared-schemas";
import { getTransactionsPaginated } from "@finance/db/queries/transactions";
import { createTransaction, updateTransaction, deleteTransaction } from "../services/transaction-service";
import { ok, created, err } from "../lib/response";
import { z } from "zod";

const querySchema = z.object({
  month:       z.string().regex(/^\d{4}-\d{2}$/).optional(),
  category_id: z.coerce.number().optional(),
  type:        z.enum(["income", "expense", "transfer"]).optional(),
  page:        z.coerce.number().default(1),
  limit:       z.coerce.number().max(100).default(20),
});

export const transactionRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/", zValidator("query", querySchema), async (c) => {
    const userId = c.get("userId");
    const q = c.req.valid("query");
    const data = await getTransactionsPaginated(userId, {
      month: q.month, categoryId: q.category_id, type: q.type,
      page: q.page, limit: q.limit,
    });
    return ok(c, data, { page: q.page, limit: q.limit });
  })

  .post("/", zValidator("json", insertTransactionSchema), async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const tx = await createTransaction(userId, input);
    return created(c, tx);
  })

  .put("/:id", zValidator("json", updateTransactionSchema), async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    try {
      const tx = await updateTransaction(userId, id, c.req.valid("json"));
      return ok(c, tx);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  })

  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.param();
    try {
      await deleteTransaction(userId, id);
      return ok(c, { message: "Đã xóa giao dịch" });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  });
