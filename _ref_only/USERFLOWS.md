# User Flows — Finance Tracker V3
**Giao thức Antigravity V1.2 · Phiên bản tài liệu: 1.0**  
**Ngày cập nhật:** 01/04/2026  
**Trạng thái:** ✅ Implemented & visualized tại `/userflows`

---

## Tổng Quan

Finance Tracker V3 có **5 user flows chính**, được thiết kế theo triết lý:
- **DB = "dumb storage"** — Không có business logic ở tầng DB
- **API (Hono.js) = brain** — Toàn bộ logic S2S, guard, validation
- **UI = trust the API** — Frontend không tự tính, chỉ render kết quả từ API

---

## Flow 1: Nhập Chi Tiêu Hàng Ngày 💸

**Trigger:** User muốn ghi nhận khoản chi tiêu tự do  
**Tần suất:** Hàng ngày (most common flow)  
**API:** `POST /api/transactions`

### Bước thực hiện:
1. **[User]** Mở App → Thấy S2S Hero (con số đầu tiên user nhìn thấy)
2. **[User]** Nhấn FAB (+) hoặc Chat AI
3. **[User]** Chọn category (Ăn Uống / Đồ Uống / Di Chuyển / Khác)
4. **[User]** Nhập số tiền + mô tả
5. **[API]** `POST /transactions` → Zod validate → ghi DB
6. **[System]** S2S Recalculation: `s2s_remaining = budget − SUM(discretionary_expenses)`
7. **[System]** UI animate cập nhật ring chart + số dư

### Zod Validation:
```typescript
z.object({
  amount: z.number().positive(),
  type: z.enum(['expense', 'income']),
  category_id: z.number().optional(),
  wallet_id: z.number().default(1),
  note: z.string().optional(),
  date: z.date().default(() => new Date()),
})
```

### State Changes:
- `transactions` table: +1 row
- `s2s_remaining` giảm đi `amount`

---

## Flow 2: Nhập Thu Nhập 💰

**Trigger:** User nhận lương / thưởng / thu nhập ngoài  
**Tần suất:** 1–3 lần/tháng  
**API:** `POST /api/transactions` (type = income)

### Bước thực hiện:
1. **[User]** Mở Quick Add / Chat AI
2. **[User]** Chọn loại "Thu Nhập"
3. **[User]** Nhập amount + nguồn thu + ví đích
4. **[API]** `POST /transactions` → type = 'income' → recalc budget
5. **[System]** S2S Budget tăng: `budget = total_income − fixed − savings − buffer`
6. **[System]** Dashboard cập nhật: total_income tăng, S2S budget tăng

### Lưu ý quan trọng:
- Nếu income vào **cash** → KHÔNG tự động sync Cash Wallet. User phải Quick Sync riêng.
- Lương định kỳ ngày `income_date` sẽ trigger S2S budget reset cho tháng mới.

### Zod Validation:
```typescript
z.object({
  amount: z.number().positive(),
  type: z.literal('income'),
  income_source: z.enum(['salary', 'bonus', 'side', 'misc']).optional(),
  wallet_id: z.number(),
})
```

---

## Flow 3: Quick Sync Ví Tiền Mặt 💵

**Trigger:** User muốn đối soát số dư ví tiền mặt  
**Tần suất:** 2–4 lần/tuần  
**API:** `PATCH /api/wallets/cash`

### Concern: Cash Wallet Isolation
Cash Wallet **tách biệt hoàn toàn** khỏi S2S. Chi tiêu bằng tiền mặt không tự động xuất hiện trong transaction feed.

### Bước thực hiện:
1. **[User]** Thấy Cash Wallet Strip (dải amber hàng 3 Dashboard)
2. **[User]** Nhấn "Quick Sync"
3. **[User]** Đếm tiền thực → nhập số tiền hiện có
4. **[System]** Preview: `diff = old_balance − new_balance`
5. **[API]** `PATCH /wallets/cash` → cập nhật balance → nếu diff > 0: tạo "Chi phí không tên"
6. **[DB]** Ghi `cash_wallets.balance` + optional misc transaction
7. **[System]** Strip cập nhật balance + timestamp

### Zod Validation:
```typescript
z.object({
  new_balance: z.number().nonnegative(),
  sync_note: z.string().optional(),
})
```

### Risk: Double-counting
Nếu user đã nhập cash expense như regular transaction, sau đó Quick Sync cũng tạo misc transaction → double count. API cần hỏi user hoặc detect.

---

## Flow 4: Chuyển Khoản ↔️

**Trigger:** User chuyển tiền giữa các ví  
**Tần suất:** 1–2 lần/tuần  
**API:** `POST /api/transfers`

### ⚠️ ĐIỂM MÙ #1: Transfer Directionless (DATABASE_ALL.md v12.0)
Schema lưu `amount` nhưng không enforce direction. API Layer phải:
- Validate `source_wallet_id ≠ dest_wallet_id`
- Check `source.balance ≥ amount`
- Tạo **2 transactions atomic** (debit + credit)
- Rollback nếu 1 trong 2 fail

### Bước thực hiện:
1. **[User]** FAB → "Chuyển khoản"
2. **[User]** Chọn Source Wallet + Destination Wallet
3. **[User]** Nhập amount
4. **[API]** Validate direction + balance → tạo 2 paired transactions
5. **[System]** S2S KHÔNG thay đổi (chỉ move tiền, không chi tiêu)
6. **[DB]** Atomic write: 2 transactions với cùng `transfer_id`
7. **[System]** UI cập nhật wallet balances

### Zod Validation:
```typescript
z.object({
  source_wallet_id: z.number(),
  dest_wallet_id: z.number(),
  amount: z.number().positive(),
  note: z.string().optional(),
}).refine(
  (d) => d.source_wallet_id !== d.dest_wallet_id,
  { message: 'Cannot transfer to same wallet' }
)
```

### API Implementation:
```typescript
// Hono.js route
app.post('/api/transfers', async (c) => {
  const data = transferSchema.parse(await c.req.json());
  
  // Begin DB transaction
  await db.transaction(async (tx) => {
    // Check source balance
    const source = await tx.query.wallets.findFirst({ where: eq(wallets.id, data.source_wallet_id) });
    if (source.balance < data.amount) throw new Error('Insufficient balance');
    
    // Debit source
    await tx.update(wallets).set({ balance: source.balance - data.amount }).where(eq(wallets.id, data.source_wallet_id));
    
    // Credit dest
    // ... both or neither
  });
});
```

---

## Flow 5: Đóng Góp Mục Tiêu 🎯

**Trigger:** User đóng góp tiền vào savings goal  
**Tần suất:** 1 lần/tháng (auto) hoặc bất cứ lúc nào  
**API:** `POST /api/goals/:id/contribute`

### ⚠️ ĐIỂM MÙ #2: Bill/Transaction Double-Dip (DATABASE_ALL.md v12.0)
Savings commitment **đã được deduct khỏi S2S budget**:
```
S2S Budget = Income − Fixed Expenses − Savings Commitment − Buffer
```

Nếu user tạo thêm expense transaction cho cùng khoản → **S2S bị tính 2 lần**.

### Double-Dip Guard (API Layer):
```typescript
// Kiểm tra: khoản đóng góp này có nằm trong monthly commitment không?
const isCommitment = contribution.amount <= (goal.monthly_contribution - alreadyContributedThisMonth);

if (isCommitment) {
  // Chỉ update goal.current_saved, KHÔNG tạo expense transaction
  // Vì khoản này đã bị deduct trong S2S formula
} else {
  const excess = contribution.amount - remaining_commitment;
  // Phần excess → tạo expense transaction (ảnh hưởng S2S)
  // Phần trong commitment → update goal only
}
```

### Bước thực hiện:
1. **[User]** Xem Goals Page → nhấn "Đóng Góp"
2. **[User]** Nhập số tiền đóng góp
3. **[API]** Double-Dip Check: commitment vs excess
4. **[System]** Commitment portion → update goal only (S2S unchanged)
5. **[System]** Excess portion → create expense transaction (S2S impacted)
6. **[DB]** `goals.current_saved + amount`
7. **[System]** Progress bar animate. Nếu completed → confetti 🎉

### Zod Validation:
```typescript
z.object({
  goal_id: z.number(),
  amount: z.number().positive(),
  note: z.string().optional(),
  is_manual: z.boolean().default(false),
})
```

---

## Sơ Đồ Kiến Trúc Flows

```
User Action
    │
    ▼
Frontend (React)
    │  Zod validation (client-side hint only)
    │
    ▼
API Layer (Hono.js) ← BRAIN — toàn bộ business logic
    │
    ├── S2S Calculation Engine
    ├── Transfer Direction Guard
    ├── Double-Dip Guard
    ├── Balance Validation
    └── Atomic Transaction Manager
         │
         ▼
    DB (TiDB Serverless via Drizzle ORM)
    Chỉ là "dumb storage" — không có stored procedures / triggers
```

---

## Điểm Mù Đã Xác Định (DATABASE_ALL.md v12.0)

| # | Tên | Mô tả | Xử lý ở |
|---|-----|--------|---------|
| 1 | Transfer Directionless | Schema không enforce source/dest | API Layer (Zod refine + DB transaction) |
| 2 | Bill/Transaction Double-Dip | Savings commitment bị deduct 2 lần | API Layer (commitment check logic) |

Cả 2 điểm mù **không cần thay đổi schema**. Được xử lý hoàn toàn ở TypeScript/Hono.js.

---

*Tài liệu này được tạo tự động bởi Finance Tracker V3 build system.*  
*Visualize tại: `/userflows` trong ứng dụng.*
