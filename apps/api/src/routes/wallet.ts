// apps/api/src/routes/wallet.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { quickSyncWalletSchema } from "@finance/shared-schemas";
import { getWallet, quickSync } from "../services/wallet-service";
import { ok, err } from "../lib/response";

export const walletRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/cash", async (c) => {
    const wallet = await getWallet(c.get("userId"));
    if (!wallet) return err(c, 404, "NOT_FOUND", "Không tìm thấy ví tiền mặt");
    return ok(c, wallet);
  })

  .put("/cash", zValidator("json", quickSyncWalletSchema), async (c) => {
    const { newBalance, note } = c.req.valid("json");
    const wallet = await quickSync(c.get("userId"), newBalance, note);
    return ok(c, wallet);
  });
