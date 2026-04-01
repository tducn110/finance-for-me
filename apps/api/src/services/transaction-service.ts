// apps/api/src/services/transaction-service.ts
// Transaction CRUD + soft delete — all queries use isNull(deletedAt)
import { db, transactions } from "@finance/db";
import { eq, and, isNull } from "drizzle-orm";
import type { InsertTransaction } from "@finance/shared-schemas";

export async function createTransaction(userId: string, input: InsertTransaction) {
  const [result] = await db.insert(transactions).values({
    userId,
    categoryId: input.categoryId,
    amount: input.amount,
    type: input.type,
    note: input.note ?? null,
    displayDate: input.displayDate,
    source: input.source ?? "manual",
    receiptUrl: input.receiptUrl ?? null,
  });

  const id = String((result as any).insertId);
  const [tx] = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return tx;
}

export async function getTransaction(userId: string, id: string) {
  const [tx] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId), isNull(transactions.deletedAt)))
    .limit(1);
  return tx ?? null;
}

export async function updateTransaction(userId: string, id: string, input: Partial<InsertTransaction>) {
  const tx = await getTransaction(userId, id);
  if (!tx) throw Object.assign(new Error("Giao dịch không tồn tại"), { code: "NOT_FOUND" });

  await db
    .update(transactions)
    .set({
      ...(input.amount && { amount: input.amount }),
      ...(input.type && { type: input.type }),
      ...(input.categoryId && { categoryId: input.categoryId }),
      ...(input.note !== undefined && { note: input.note ?? null }),
      ...(input.displayDate && { displayDate: input.displayDate }),
      ...(input.receiptUrl !== undefined && { receiptUrl: input.receiptUrl ?? null }),
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, id));

  return getTransaction(userId, id);
}

// Soft delete — sets deletedAt, never removes the row (audit trail)
export async function deleteTransaction(userId: string, id: string) {
  const tx = await getTransaction(userId, id);
  if (!tx) throw Object.assign(new Error("Giao dịch không tồn tại"), { code: "NOT_FOUND" });

  await db
    .update(transactions)
    .set({ deletedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}
