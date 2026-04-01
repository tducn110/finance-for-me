// apps/api/src/services/s2s-engine.ts
// S2S (Safe-to-Spend) calculation engine — pure TypeScript, no DB Views
// Formula: S2S = Income - Expense - FixedCosts - GoalsAllocation - EmergencyBuffer
import Decimal from "decimal.js";
import {
  getMonthlySummary,
  getUserFinancialConfig,
  getActiveBillsTotal,
  getActiveGoalsAllocation,
} from "@finance/db/queries/summary";

export interface S2SResult {
  safeToSpend: string;      // "1500000.00" — decimal string
  isOverBudget: boolean;
  totalIncome: string;
  totalExpense: string;
  fixedCostsPending: string;
  goalsAllocation: string;
  emergencyBuffer: string;
  monthlyBudget: string;
  period: string;           // "YYYY-MM"
}

export async function calculateSafeToSpend(
  userId: string,
  month: string, // "YYYY-MM"
): Promise<S2SResult> {
  // Parallel queries for performance
  const [summary, config, billsTotal, goalsAlloc] = await Promise.all([
    getMonthlySummary(userId, month),
    getUserFinancialConfig(userId),
    getActiveBillsTotal(userId),
    getActiveGoalsAllocation(userId),
  ]);

  // Use Decimal.js to avoid floating-point errors
  const income          = new Decimal(summary.totalIncome);
  const expense         = new Decimal(summary.totalExpense);
  const fixedCosts      = new Decimal(billsTotal);
  const goalsAllocation = new Decimal(goalsAlloc);
  const emergencyBuffer = new Decimal(config?.emergencyBuffer ?? "0");
  const monthlyBudget   = new Decimal(config?.monthlyBudget ?? "0");

  // S2S = Income - Expense - FixedCosts - GoalsAllocation - EmergencyBuffer
  const safeToSpend = income
    .minus(expense)
    .minus(fixedCosts)
    .minus(goalsAllocation)
    .minus(emergencyBuffer);

  return {
    safeToSpend:      safeToSpend.toFixed(2),
    isOverBudget:     safeToSpend.isNegative(),
    totalIncome:      income.toFixed(2),
    totalExpense:     expense.toFixed(2),
    fixedCostsPending: fixedCosts.toFixed(2),
    goalsAllocation:  goalsAllocation.toFixed(2),
    emergencyBuffer:  emergencyBuffer.toFixed(2),
    monthlyBudget:    monthlyBudget.toFixed(2),
    period:           month,
  };
}
