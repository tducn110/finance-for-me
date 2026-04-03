// packages/shared-schemas/src/transaction.schema.ts
import { z } from "zod";

// ── Decimal string coercion helper ────────────────────────────────
// Input: number hoặc string → Output: string decimal "50000.00"
// Dùng string để tránh floating-point errors khi lưu vào Drizzle Decimal column
const decimalString = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const n = typeof val === "number" ? val : parseFloat(val);
    if (isNaN(n) || n <= 0) throw new Error("Số tiền phải là số dương");
    return n.toFixed(2); // "50000.00"
  });

// ── Insert ─────────────────────────────────────────────────────────
export const insertTransactionSchema = z.object({
  categoryId:  z.number().int().positive(),
  amount:      decimalString,
  type:        z.enum(["income", "expense", "transfer"]),
  note:        z.string().max(500).optional(),
  // [v12.0-A] displayDate: user gửi "YYYY-MM-DD" hoặc Date object
  // transform → chuẩn hóa thành string "YYYY-MM-DD" cho Drizzle DATE column
  // Tránh timezone confusion: user kiểm soát, không phải system clock
  displayDate: z.coerce.date().transform((d) =>
    d.toISOString().split("T")[0], // → "2026-04-01"
  ),
  source:      z.enum(["manual", "quick_add", "ocr", "import", "recurring"]).default("manual"),
  receiptUrl:  z.string().url().optional(),
});

// ── Update ─────────────────────────────────────────────────────────
export const updateTransactionSchema = insertTransactionSchema.partial();

// ── Response ────────────────────────────────────────────────────────
// amount: string "50000.00" — giữ nguyên string, client tự format với Intl.NumberFormat
export const transactionResponseSchema = z.object({
  id:          z.string(),
  userId:      z.string(),
  categoryId:  z.number(),
  amount:      z.string(),   // "50000.00"
  type:        z.enum(["income", "expense", "transfer"]),
  note:        z.string().nullable(),
  displayDate: z.string(),   // "2026-04-01"
  source:      z.string(),
  receiptUrl:  z.string().nullable(),
  createdAt:   z.coerce.date(),
  deletedAt:   z.coerce.date().nullable(),
});

export type InsertTransaction    = z.infer<typeof insertTransactionSchema>;
export type UpdateTransaction    = z.infer<typeof updateTransactionSchema>;
export type TransactionResponse  = z.infer<typeof transactionResponseSchema>;
