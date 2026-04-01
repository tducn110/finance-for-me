// apps/api/src/routes/finance.ts
// S2S Engine endpoints
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { calculateSafeToSpend } from "../services/s2s-engine";
import { ok } from "../lib/response";

const monthQuery = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).default(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }),
});

const impactBody = z.object({
  amount: z.string(),
  type:   z.enum(["income", "expense"]),
});

export const financeRoutes = new Hono<{ Variables: { userId: string } }>()

  // GET /api/finance/safe-to-spend?month=YYYY-MM
  .get("/safe-to-spend", zValidator("query", monthQuery), async (c) => {
    const { month } = c.req.valid("query");
    const result = await calculateSafeToSpend(c.get("userId"), month);
    return ok(c, result);
  })

  // POST /api/finance/check-impact — preview S2S change before transacting
  .post("/check-impact", zValidator("json", impactBody), async (c) => {
    const { amount, type } = c.req.valid("json");
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const current = await calculateSafeToSpend(c.get("userId"), month);
    const { default: Decimal } = await import("decimal.js");
    const currentS2S = new Decimal(current.safeToSpend);
    const impact = type === "income"
      ? currentS2S.plus(amount)
      : currentS2S.minus(amount);

    return ok(c, {
      currentS2S: current.safeToSpend,
      projectedS2S: impact.toFixed(2),
      isOverBudgetAfter: impact.isNegative(),
      delta: (type === "income" ? "+" : "-") + amount,
    });
  });
