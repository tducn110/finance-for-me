// apps/api/src/services/bill-service.ts
// Bill payment logic — replaces sp_generate_bill_payments_for_month
// [FIX #3] Status tính từ SUM(amount_paid), không lưu trong DB
import Decimal from "decimal.js";
import { db, bills, billPayments } from "@finance/db";
import { eq, and, isNull, sum } from "drizzle-orm";
import type { InsertBillPayment } from "@finance/shared-schemas";

export type BillStatus = "paid" | "partial" | "pending";

export async function getBillPaymentStatus(billId: string, periodMonth: string): Promise<{ status: BillStatus; totalPaid: string }> {
  const [row] = await db
    .select({ total: sum(billPayments.amountPaid) })
    .from(billPayments)
    .where(and(eq(billPayments.billId, billId), eq(billPayments.periodMonth, periodMonth)));

  const totalPaid = new Decimal(row?.total ?? "0");
  const [bill] = await db.select({ amount: bills.amount }).from(bills).where(eq(bills.id, billId)).limit(1);
  const billAmount = new Decimal(bill?.amount ?? "0");

  const status: BillStatus =
    totalPaid.gte(billAmount) ? "paid" :
    totalPaid.gt(0)           ? "partial" : "pending";

  return { status, totalPaid: totalPaid.toFixed(2) };
}

export async function payBill(userId: string, input: InsertBillPayment) {
  const [bill] = await db
    .select()
    .from(bills)
    .where(and(eq(bills.id, input.billId), eq(bills.userId, userId), isNull(bills.deletedAt)))
    .limit(1);

  if (!bill) throw Object.assign(new Error("Hóa đơn không tồn tại"), { code: "NOT_FOUND" });

  // Check already fully paid
  const { status } = await getBillPaymentStatus(input.billId, input.periodMonth);
  if (status === "paid") {
    throw Object.assign(new Error("Hóa đơn kỳ này đã thanh toán đủ"), { code: "ALREADY_PAID" });
  }

  const [result] = await db.insert(billPayments).values({
    billId: input.billId,
    userId,
    periodMonth: input.periodMonth,
    amountPaid: input.amountPaid,
    note: input.note ?? null,
  });

  const id = String((result as any).insertId);
  const [payment] = await db.select().from(billPayments).where(eq(billPayments.id, id)).limit(1);
  return payment;
}

export async function getActiveBills(userId: string) {
  return db
    .select()
    .from(bills)
    .where(and(eq(bills.userId, userId), eq(bills.isActive, 1), isNull(bills.deletedAt)));
}

export async function deleteBill(userId: string, id: string) {
  const [bill] = await db.select().from(bills)
    .where(and(eq(bills.id, id), eq(bills.userId, userId), isNull(bills.deletedAt)))
    .limit(1);
  if (!bill) throw Object.assign(new Error("Hóa đơn không tồn tại"), { code: "NOT_FOUND" });
  await db.update(bills).set({ deletedAt: new Date() }).where(eq(bills.id, id));
}
