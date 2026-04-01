// packages/db/src/queries/transactions.ts
// Drizzle query builders for transactions — thay thế View v_category_spending_current
import { db } from "../index";
import { transactions } from "../schema";
import { and, eq, gte, lte, isNull, desc } from "drizzle-orm";

// Get transactions for a user within a date range (used by S2S Engine)
export async function getMonthlyTransactions(
  userId: string,
  month: string, // "YYYY-MM"
) {
  const [year, mon] = month.split("-").map(Number);
  const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
  const lastDay = new Date(year, mon, 0).getDate();
  const endDate = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.displayDate, startDate),
        lte(transactions.displayDate, endDate),
        isNull(transactions.deletedAt), // ← Soft delete filter — ALWAYS required
      ),
    )
    .orderBy(desc(transactions.displayDate));
}

// Get transactions with pagination for list view
export async function getTransactionsPaginated(
  userId: string,
  opts: {
    month?: string;
    categoryId?: number;
    type?: "income" | "expense" | "transfer";
    page?: number;
    limit?: number;
  } = {},
) {
  const { month, categoryId, type, page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;

  const filters = [
    eq(transactions.userId, userId),
    isNull(transactions.deletedAt), // Always filter soft-deleted
  ];

  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    filters.push(gte(transactions.displayDate, startDate));
    filters.push(lte(transactions.displayDate, endDate));
  }

  if (categoryId) filters.push(eq(transactions.categoryId, categoryId));
  if (type) filters.push(eq(transactions.type, type));

  return db
    .select()
    .from(transactions)
    .where(and(...filters))
    .orderBy(desc(transactions.displayDate))
    .limit(limit)
    .offset(offset);
}
