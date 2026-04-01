// apps/api/src/services/wallet-service.ts
// Cash wallet Quick Sync — atomic transaction + auto misc-expense detection
// Replaces sp_cash_wallet_sync Stored Procedure
import Decimal from "decimal.js";
import { db, cashWallet, cashWalletLogs, transactions, categories } from "@finance/db";
import { eq, and, isNull } from "drizzle-orm";

export async function getWallet(userId: string) {
  const [wallet] = await db
    .select()
    .from(cashWallet)
    .where(eq(cashWallet.userId, userId))
    .limit(1);

  if (!wallet) return null;

  const netChange = new Decimal(wallet.balance).minus(new Decimal(wallet.initialBalance));
  return { ...wallet, netChange: netChange.toFixed(2) };
}

// Quick Sync: user enters actual cash count → auto-detect difference
// If diff < 0 → auto-create misc expense transaction
export async function quickSync(userId: string, newBalance: string, note?: string) {
  const [wallet] = await db.select().from(cashWallet).where(eq(cashWallet.userId, userId)).limit(1);
  if (!wallet) throw Object.assign(new Error("Không tìm thấy ví tiền mặt"), { code: "NOT_FOUND" });

  const before = new Decimal(wallet.balance);
  const after  = new Decimal(newBalance);
  const diff   = after.minus(before);

  await db.transaction(async (tx) => {
    let autoTxId: string | null = null;

    // Auto-create misc expense if money went down (diff negative)
    if (diff.isNegative()) {
      // Find or use "Khác" category (id=11 from seed data)
      const [miscCat] = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(and(isNull(categories.userId), eq(categories.name, "Khác")))
        .limit(1);

      const catId = miscCat?.id ?? 11;

      const [result] = await tx.insert(transactions).values({
        userId,
        categoryId: catId,
        amount: diff.abs().toFixed(2),
        type: "expense",
        note: note ?? "Chi phí không ghi nhận (Quick Sync)",
        displayDate: new Date().toISOString().split("T")[0],
        source: "quick_add",
      });

      autoTxId = String((result as any).insertId);
    }

    // Update wallet balance
    await tx.update(cashWallet).set({
      balance: after.toFixed(2),
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(cashWallet.userId, userId));

    // Insert audit log
    await tx.insert(cashWalletLogs).values({
      userId,
      balanceBefore: before.toFixed(2),
      balanceAfter:  after.toFixed(2),
      difference:    diff.toFixed(2),
      note: note ?? null,
      autoTxId,
    });
  });

  return getWallet(userId);
}
