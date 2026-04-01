// packages/db/src/queries/summary.ts
// Monthly summary queries — thay thế View v_monthly_summary
// Dùng bởi S2S Engine tại apps/api/src/services/s2s-engine.ts
import { db } from "../index";
import { transactions, bills, goals, userSettings } from "../schema";
import { and, eq, gte, lte, isNull, sum } from "drizzle-orm";

interface MonthlySummary {
  totalIncome: string;  // decimal string
  totalExpense: string;
}

export async function getMonthlySummary(
  userId: string,
  month: string, // "YYYY-MM"
): Promise<MonthlySummary> {
  const [year, mon] = month.split("-").map(Number);
  const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
  const lastDay = new Date(year, mon, 0).getDate();
  const endDate = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const dateFilter = and(
    eq(transactions.userId, userId),
    gte(transactions.displayDate, startDate),
    lte(transactions.displayDate, endDate),
    isNull(transactions.deletedAt),
  );

  const [incomeRow] = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(and(dateFilter, eq(transactions.type, "income")));

  const [expenseRow] = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(and(dateFilter, eq(transactions.type, "expense")));

  return {
    totalIncome:  incomeRow?.total  ?? "0.00",
    totalExpense: expenseRow?.total ?? "0.00",
  };
}

// Get user settings (emergency buffer, etc.) for S2S calculation
export async function getUserFinancialConfig(userId: string) {
  const [settings] = await db
    .select({
      monthlyBudget:  userSettings.monthlyBudget,
      emergencyBuffer: userSettings.emergencyBuffer,
      incomeDate:     userSettings.incomeDate,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  return settings;
}

// Get total active bills commitment for the month
export async function getActiveBillsTotal(userId: string) {
  const [row] = await db
    .select({ total: sum(bills.amount) })
    .from(bills)
    .where(
      and(
        eq(bills.userId, userId),
        eq(bills.isActive, 1),
        isNull(bills.deletedAt),
      ),
    );

  return row?.total ?? "0.00";
}

// Get total active goals monthly contribution
export async function getActiveGoalsAllocation(userId: string) {
  const [row] = await db
    .select({ total: sum(goals.monthlyContribution) })
    .from(goals)
    .where(
      and(
        eq(goals.userId, userId),
        eq(goals.status, "active"),
        isNull(goals.deletedAt),
      ),
    );

  return row?.total ?? "0.00";
}
