# 📋 S2S Finance — Development Journey & Complete Summary

> **Tài liệu tổng kết**: Toàn bộ quá trình phát triển, chẩn đoán và fix
> **Ngày tạo**: 1 tháng 4, 2026 | **Cập nhật lần cuối**: 1 tháng 4, 2026 (v11.0 — Architecture Audit)
> **Dự án**: S2S Finance — Ứng dụng Quản Lý Tài Chính Cá Nhân
> **Triết lý UX**: Behavioral Finance theo **Giao thức Antigravity V1.2**

---

## 🎯 TÓM TẮT DỰ ÁN

**S2S Finance** là ứng dụng quản lý tài chính cá nhân được thiết kế với triết lý **Behavioral Finance**, tập trung vào một câu hỏi cốt lõi duy nhất:

> **"Bạn còn có thể tiêu bao nhiêu tiền hôm nay mà không phá vỡ kế hoạch tài chính?"**

### Công thức S2S (Safe-to-Spend)

```
S2S = Thu Nhập - Chi Tiêu - Chi Phí Cố Định - Phân Bổ Mục Tiêu - Quỹ Khẩn Cấp
```

- **Xanh lá** khi S2S > 0 → Ngân sách an toàn
- **Đỏ** khi S2S ≤ 0 → Cảnh báo vượt ngân sách

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### ✅ Stack Chính Thức (Finance Tracker V3 — Option A Confirmed)

> **Quyết định kiến trúc ngày 1/4/2026:** Xác nhận chính thức **Option A** — Monorepo Turborepo với Hono.js + Vercel Edge + TiDB Serverless + Drizzle ORM. Mọi tài liệu cũ đề cập Express/NestJS/Nginx/PM2/MySQL đơn thuần đều là tàn dư v10.x và đã bị xóa bỏ hoàn toàn.

| Layer | Công nghệ | Workspace |
|-------|-----------|-----------|
| Monorepo Manager | **Turborepo** + pnpm workspaces | Root |
| Frontend | **Next.js 14** (App Router) | `apps/web` |
| Backend | **Hono.js** → Vercel Edge Functions | `apps/api` |
| Database | **TiDB Serverless** + **Drizzle ORM** (HTTP Driver) | `packages/db` |
| Shared Schemas | **Zod** validation schemas | `packages/shared-schemas` |

### Prototype hiện tại (React + Vite — 100% hoàn thành)

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| React | 18.3.1 | UI framework |
| TypeScript | Latest (via Vite) | Type safety |
| Vite | 6.3.5 | Build tool + Dev server |
| Tailwind CSS | v4.1.12 | Utility-first styling |
| React Router | 7.13.0 | Client-side routing (Data mode) |
| Motion (Framer) | 12.23.24 | Animation engine |
| Recharts | 2.15.2 | Charts (Donut, Bar, Line) |
| Lucide React | 0.487.0 | Icon library |
| Radix UI + Shadcn/UI | Multiple | Component library |
| React Hook Form | 7.55.0 | Form state management |
| Sonner | 2.0.3 | Toast notifications |

### Cấu trúc File System (prototype hiện tại)

```
/src/app
├── App.tsx                    # Root component (RouterProvider)
├── routes.tsx                 # Routing config
├── components/
│   ├── Layout.tsx             # Shell: Sidebar + Header + Outlet
│   ├── CashWalletWidget.tsx   # Ví tiền mặt + Quick Sync
│   ├── ChatQuickAdd.tsx       # AI chat quick-add modal
│   ├── QuickAddModal.tsx      # Form quick-add modal (FAB)
│   ├── CategoryManager.tsx    # CRUD danh mục
│   ├── figma/                 # Figma-imported components
│   └── ui/                    # Shadcn/Radix primitives
├── pages/
│   ├── Dashboard.tsx          # 🏠 Trang chủ (MAIN PAGE)
│   ├── Transactions.tsx       # Lịch sử giao dịch
│   ├── Goals.tsx              # Mục tiêu tiết kiệm
│   ├── Bills.tsx              # Hóa đơn cố định
│   ├── Analytics.tsx          # Biểu đồ phân tích
│   ├── Settings.tsx           # Cài đặt tài khoản
│   ├── Login.tsx              # Đăng nhập
│   ├── Register.tsx           # Đăng ký
│   └── Wireframes.tsx         # 🎨 Lo-fi wireframe (8 màn hình)
├── data/
│   └── mockData.ts            # Mock data (dev mode)
├── hooks/
│   └── useAPI.ts              # React hooks wrapping API
└── services/
    └── api.ts                 # APIClient class (fetch-based)
```

### Monorepo Target Structure (Turborepo)

```
finance-tracker/
├── apps/
│   ├── web/                   # Next.js 14 App Router (migrate từ Vite prototype)
│   └── api/                   # Hono.js → Vercel Edge
├── packages/
│   ├── db/                    # Drizzle ORM schemas + queries + migrations
│   └── shared-schemas/        # Zod schemas (100% shared web & api)
├── turbo.json
└── pnpm-workspace.yaml
```

### Database Schema (TiDB Serverless) — 12 bảng

Toàn bộ schema được định nghĩa chi tiết trong `/DATABASE_ALL.md` (**đã đại phẫu v11.0**):

1. **users** — Tài khoản người dùng
2. **user_settings** — Cấu hình tài chính (1:1 với users)
3. **refresh_tokens** — JWT refresh token management
4. **categories** — Danh mục thu/chi (system + user-defined)
5. **transactions** — Nhật ký giao dịch (bảng cốt lõi)
6. **bills** — Hóa đơn cố định định kỳ
7. **bill_payments** — Lịch sử thanh toán hóa đơn
8. **goals** — Mục tiêu tiết kiệm dài hạn
9. **cash_wallet** — Ví tiền mặt (1:1 với users)
10. **cash_wallet_logs** — Lịch sử Quick Sync
11. **notifications** — Thông báo hệ thống
12. **audit_logs** — Ghi log thao tác quan trọng

> **⚠️ v11.0 Breaking Change — Đã xóa khỏi Database layer:**
> - Views: `v_monthly_summary`, `v_safe_to_spend`, `v_category_spending_current`, `v_upcoming_bills`
> - Stored Procedures: `sp_generate_bill_payments_for_month`, `sp_cash_wallet_sync`
> - Triggers: `trg_after_user_insert`, `trg_goals_auto_complete`, `trg_audit_transaction_delete`
>
> Toàn bộ business logic đã chuyển về `apps/api/src/services/`.

---

## 🧩 GIAO THỨC ANTIGRAVITY V1.2

### Triết lý UX Core

**Antigravity V1.2** là nguyên tắc thiết kế dashboard theo **Behavioral Finance**, đảo ngược hierarchy truyền thống của các ứng dụng tài chính:

#### ❌ Vấn đề của UX truyền thống:
- **3 metrics kế toán** (Số Dư, Thu Nhập, Chi Tiêu) thường được đặt nổi bật nhất
- Người dùng phải tự tính toán: "Tôi còn bao nhiêu tiền để chi?"
- **Cognitive load cao**, gây stress và quyết định kém

#### ✅ Giải pháp Antigravity V1.2:
1. **S2S (Safe-to-Spend) là Hero Section**
   - Chỉ số DUY NHẤT quan trọng
   - Full-width, chiếm toàn bộ fold đầu tiên
   - Font size lớn nhất (~48px số tiền)
   - Dark theme nổi bật (navy gradient)
   - Không có element nào chen trước S2S

2. **3 metrics kế toán BỊ HẠ CẤP (Demoted)**
   - Thu nhỏ xuống hàng phụ
   - Styling mờ nhạt (gray-50 bg, thin border)
   - Font size nhỏ (~12px số tiền)
   - Không icon nổi bật, không badge tăng trưởng

3. **Cash Wallet cô lập thành dải ngang**
   - Không được gộp chung với Bills
   - Nằm độc lập, màu amber nhẹ (#FFFBEB)
   - Horizontal strip, mỏng và ngang
   - Nhấn mạnh "Quick Sync" để cập nhật nhanh

4. **Annotation numbering đúng hierarchy**
   - S2S = số 7 (sau shell UI 1-6)
   - 3 cards demoted = 8, 9, 10
   - Cash Wallet = 11
   - Detail cards = 12, 13, 14, 15

---

## 🔧 CÁC FIX VÀ CẢI TIẾN ĐÃ THỰC HIỆN

### 1️⃣ **Chẩn đoán và vá hoàn toàn 4 điểm mù UX trong Dashboard**

#### **Wireframe `/src/app/pages/Wireframes.tsx` — ScreenDashboard**

**Trước khi fix:**
- Banner AI Chat chen trước S2S (vi phạm Antigravity V1.2)
- 3 cards metrics vẫn có styling nổi bật
- Cash Wallet dính chung với Bills trong cột phải
- Annotation numbering không phản ánh đúng hierarchy

**Sau khi fix (HOÀN TẤT):**

✅ **Fix #1: S2S Hero Section**
```tsx
{/* HANG 1 — HERO S2S: So tien lon nhat trang, chiem toan bo fold dau */}
{/* Antigravity V1.2: khong co gi chen truoc S2S. Height ~2.5x card phu. */}
<div style={{
  border: "3px solid #1F2937", borderRadius: 16, padding: "28px 32px",
  backgroundColor: "#374151", position: "relative", minHeight: 210,
}}>
  {/* 48px font cho số tiền, dark theme, full prominence */}
  <WMark n={7} className="absolute top-2 right-2" />
</div>
```

✅ **Fix #2: 3 Cards Metrics "Demoted"**
```tsx
{/* HANG 2 — CHI SO KE TOAN BI HA CAP (DEMOTED) */}
{/* Khong icon noi bat. Khong badge %. Nen xam nhat. So mo. */}
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
  {[{ n: 8 }, { n: 9 }, { n: 10 }].map((card) => (
    <div style={{
      border: "1.5px solid #E5E7EB",  // Thin border
      borderRadius: 10,
      padding: "10px 14px",            // Compact padding
      backgroundColor: "#F9FAFB",      // Very light gray
    }}>
      {/* 12px font, muted colors, no icons */}
      <div style={{ height: 12, width: 95, backgroundColor: "#9CA3AF" }} />
    </div>
  ))}
</div>
```

✅ **Fix #3: Cash Wallet Cô Lập**
```tsx
{/* HANG 3 — VI TIEN MAT: CO LAP THANH DAI NGANG DOC LAP */}
{/* Khong nam cung column voi Bills. Dai mong, nam ngang = thu yeu. */}
<div style={{
  border: "1.5px solid #FDE68A",     // Amber border
  borderRadius: 10,
  padding: "9px 16px",               // Thin horizontal strip
  backgroundColor: "#FFFBEB",        // Light amber bg
  display: "flex",
  alignItems: "center",
  gap: 14,
}}>
  {/* Icon + balance + Quick Sync button */}
  <WMark n={11} />
</div>
```

✅ **Fix #4: Annotation Hierarchy**
```
1-6:  Shell UI (Sidebar, Nav, Header, Search, Bell, Avatar)
7:    S2S Hero Section ← MOST IMPORTANT
8-10: 3 Demoted Cards (Balance, Income, Expense)
11:   Cash Wallet Strip
12:   Recent Transactions
13:   Goals
14:   Bills
15:   Spending Chart
```

**Kết quả:**
- ✅ S2S trở thành visual anchor duy nhất
- ✅ 3 metrics không còn cạnh tranh attention
- ✅ Cash Wallet không bị nhầm lẫn với Bills
- ✅ Numbering phản ánh đúng importance visual

---

### 2️⃣ **Fix lỗi duplicate keys trong Recharts (`/src/app/pages/Analytics.tsx`)**

#### **Vấn đề:**
- Recharts component bắn warning: `Two children with the same key`
- Nguyên nhân: Recharts tự generate keys cho primitives như `<Line>`, `<Bar>`
- Conflict khi cả parent (ResponsiveContainer) và child đều có `key`

#### **Giải pháp đã áp dụng:**

✅ **Khôi phục `key` trên series components**
```tsx
// BarChart
<Bar
  key="bar-income"          // ✅ Đặt key ở đây
  dataKey="income"
  name="income"
  fill="#10B981"
  radius={[6, 6, 0, 0]}
  isAnimationActive={false}  // ✅ Tắt animation để tránh conflict
/>
```

✅ **Thêm `isAnimationActive={false}`**
- Animation có thể trigger re-render và duplicate keys
- Tắt animation để ổn định rendering

✅ **Cell loop trong PieChart**
```tsx
{categorySpending.map((entry, index) => (
  <Cell
    key={`cell-${entry.name}-${index}`}  // ✅ Unique key
    fill={entry.color}
  />
))}
```

**Kết quả:**
- ✅ Không còn warning `Two children with the same key`
- ✅ Charts render đúng và ổn định

---

### 3️⃣ **Wireframes Document — 8 màn hình Lo-fi Prototype**

**File:** `/src/app/pages/Wireframes.tsx`
**Route:** `/wireframes`
**Đã đăng ký:** `routes.tsx`

#### **8 màn hình wireframe:**

1. **Login** — Form đăng nhập đơn giản
2. **Register** — Form đăng ký + Finance config
3. **Dashboard** ← Màn hình chính, đã fix 100% theo Antigravity V1.2
4. **Transactions** — CRUD giao dịch (table + sidebar form)
5. **Goals** — Danh sách mục tiêu tiết kiệm
6. **Bills** — Hóa đơn cố định + thanh toán
7. **Analytics** — Charts (Bar, Pie, Line)
8. **Settings** — Cài đặt profile, tài chính, danh mục

---

### 4️⃣ **[v11.0] Architecture Audit & Đại Phẫu Tài Liệu**

#### **Vấn đề phát hiện:**

Qua kiểm tra toàn diện, phát hiện **3 mâu thuẫn nghiêm trọng** trong tài liệu v10.x:

| # | Mâu thuẫn | File bị ảnh hưởng | Nghiêm trọng |
|---|-----------|-------------------|-------------|
| 1 | Stack cũ ghi Express/NestJS + Nginx + PM2, trong khi stack thực tế cần Hono.js + Vercel Edge | `SYSTEM_ARCHITECTURE.md` | 🔴 CRITICAL |
| 2 | `DATABASE_ALL.md` chứa Views, Stored Procedures, Triggers mang Business Logic vi phạm Clean Architecture | `DATABASE_ALL.md` | 🔴 CRITICAL |
| 3 | Infrastructure diagram vẽ MySQL + Redis local trong khi cần TiDB Serverless + Upstash Redis | `SYSTEM_ARCHITECTURE.md` | 🔴 CRITICAL |

#### **Hành động đã thực hiện (Đại Phẫu v11.0):**

**`SYSTEM_ARCHITECTURE.md` — Viết lại hoàn toàn:**
- ✅ Xóa toàn bộ phần Express/NestJS/Nginx/PM2
- ✅ Thêm Monorepo Turborepo structure (Section 2)
- ✅ Thêm Hono.js + Vercel Edge tech stack (Section 3)
- ✅ Thêm Clean Architecture section (Section 4) với TypeScript service code
- ✅ Thêm S2S Engine implementation (`calculateSafeToSpend` TypeScript function)
- ✅ Thêm Business Logic services thay thế từng Trigger/SP bị xóa
- ✅ Cập nhật Infrastructure diagram (Vercel CDN → Hono → TiDB)
- ✅ Cập nhật Environment Variables (DATABASE_URL, RESEND_API_KEY, UPSTASH_REDIS_*)
- ✅ Thêm Turbo Pipeline config (Section 13)
- ✅ Thêm Drizzle + TiDB connection code (Section 7)

**`DATABASE_ALL.md` — Đại phẫu triệt để:**
- ✅ Đổi header từ MySQL 8.x → TiDB Serverless + Drizzle ORM
- ✅ Xóa `VIEWS` section (4 views: v_monthly_summary, v_safe_to_spend, v_category_spending_current, v_upcoming_bills)
- ✅ Xóa `STORED PROCEDURES` section (2 SPs: sp_generate_bill_payments_for_month, sp_cash_wallet_sync)
- ✅ Xóa `TRIGGERS` section (3 triggers: trg_after_user_insert, trg_goals_auto_complete, trg_audit_transaction_delete)
- ✅ Thêm `DRIZZLE ORM SCHEMA` section với TypeScript schema definitions
- ✅ Thêm TiDB vs MySQL 8.x comparison table
- ✅ Cập nhật NAMING CONVENTIONS (gạch bỏ Trigger/SP/View rows)
- ✅ Thêm warning comments trong từng table về service layer thay thế
- ✅ Xóa `MYSQL SETTINGS (my.cnf)` section (không còn relevant với serverless)

---

## 📊 CÁC FILE TÀI LIỆU CHÍNH

### 1. `/SYSTEM_ARCHITECTURE.md`
- **Nội dung:** Kiến trúc Monorepo Turborepo (Option A confirmed), Hono.js + Vercel Edge + TiDB Serverless + Drizzle ORM, Clean Architecture services, API endpoints, color palette, dimensions
- **Trạng thái:** ✅ **Đã đại phẫu v11.0** — Xóa hoàn toàn Express/Nginx/PM2/MySQL cũ

### 2. `/DATABASE_ALL.md`
- **Nội dung:** Full SQL schema (12 tables), Drizzle ORM TypeScript schemas, ERD, indexes, FK relationships, seed data — **KHÔNG có Views/SP/Triggers**
- **Trạng thái:** ✅ **Đã đại phẫu v11.0** — Xóa 4 Views + 2 SPs + 3 Triggers; chuyển logic về `apps/api/services/`

### 3. `/src/app/pages/Wireframes.tsx`
- **Nội dung:** 8 màn hình wireframe lo-fi với annotation system
- **Trạng thái:** ✅ Hoàn chỉnh 100% + Fix Antigravity V1.2

### 4. `/CHANGELOG_AND_SUMMARY.md` (file này)
- **Nội dung:** Tổng kết toàn bộ quá trình phát triển, fix, và chẩn đoán
- **Trạng thái:** ✅ Đã cập nhật v11.0 (Architecture Audit + Đại Phẫu)

---

## ✅ TRẠNG THÁI DỰ ÁN

### **Đã hoàn thành (Frontend 100% + Architecture Docs v11.0)**

| # | Tính năng | Trạng thái |
|---|-----------|------------|
| 1 | UI/UX toàn bộ 8 màn hình | ✅ Hoàn chỉnh |
| 2 | Dashboard theo Antigravity V1.2 | ✅ Đã fix 4 điểm mù UX |
| 3 | Routing (React Router Data mode) | ✅ Đã config |
| 4 | Layout (Collapsible sidebar + Header) | ✅ Responsive |
| 5 | Mock data (dev mode) | ✅ mockData.ts |
| 6 | API Client structure | ✅ services/api.ts + hooks/useAPI.ts |
| 7 | Charts (Recharts) | ✅ Đã fix duplicate keys |
| 8 | Animation (Motion/Framer) | ✅ Toàn bộ transitions |
| 9 | Forms (React Hook Form) | ✅ Validation schemas |
| 10 | Notifications (Sonner) | ✅ Toast system |
| 11 | Wireframes document | ✅ 8 màn hình + annotations |
| 12 | **[v11.0] Architecture Audit** | ✅ Phát hiện 3 mâu thuẫn nghiêm trọng |
| 13 | **[v11.0] SYSTEM_ARCHITECTURE.md đại phẫu** | ✅ Monorepo Option A, Hono.js, TiDB |
| 14 | **[v11.0] DATABASE_ALL.md đại phẫu** | ✅ Xóa Views/SP/Triggers; Tables only |
| 15 | **[v11.0] Clean Architecture enforcement** | ✅ Logic map: DB → API services |

### **Chưa làm (Backend & Integration)**

| # | Tính năng | Mức độ | Mô tả |
|---|-----------|--------|-------|
| 1 | **Monorepo Init** | 🔴 CRITICAL | `pnpm dlx create-turbo` chưa chạy |
| 2 | **Backend API (Hono.js)** | 🔴 CRITICAL | Chưa có file nào trong `apps/api` |
| 3 | **Authentication** | 🔴 CRITICAL | JWT token + refresh token (dùng Jose) |
| 4 | **S2S Engine** | 🔴 CRITICAL | `calculateSafeToSpend()` chưa implement |
| 5 | **packages/db (Drizzle)** | 🔴 CRITICAL | Schema TypeScript files chưa tạo |
| 6 | **TiDB Serverless** | 🔴 CRITICAL | Cluster chưa tạo, DATABASE_URL chưa có |
| 7 | **Data persistence** | 🔴 CRITICAL | Toàn bộ data đang là mock |
| 8 | **AI Quick-Add** | 🟡 HIGH | NLP parse "ăn sáng 30k" (OpenAI) |
| 9 | **OCR Receipt** | 🟡 HIGH | Scan hóa đơn (Google Vision) |
| 10 | **Bill reminders** | 🟡 HIGH | Vercel Cron Jobs |
| 11 | **Next.js Migration** | 🟡 HIGH | Migrate Vite prototype → Next.js 14 App Router |
| 12 | **Dark mode toggle** | 🟢 MEDIUM | CSS tokens đã có, thiếu UI toggle |
| 13 | **Export CSV/PDF** | 🟢 MEDIUM | Báo cáo tài chính |
| 14 | **PWA** | 🔵 LATER | Progressive Web App |

### **Flag quan trọng:**

```typescript
// services/api.ts & hooks/useAPI.ts
const USE_REAL_API = false;  // ← BẬT thành true khi backend ready
```

---

## 🎨 DESIGN SYSTEM

### **Bảng màu chính**

| Màu | Hex / Tailwind | Dùng ở đâu |
|-----|----------------|------------|
| Blue primary | `#3B82F6` / `blue-500` | Nav active, buttons, links |
| Indigo | `#6366F1` / `indigo-600` | Gradient accent |
| Emerald | `#10B981` / `emerald-500` | Income, positive values, S2S positive |
| Red | `#EF4444` / `red-500` | Expense, negative values, S2S negative |
| Amber | `#F59E0B` / `amber-400` | Cash wallet, food category |
| Orange | `#F97316` / `orange-500` | Gradient với amber |
| Purple | `#8B5CF6` / `purple-500` | Rent category, goals icon |
| Yellow | `#EAB308` | Transport category |
| Gray | `#6B7280` | Other category, muted text |
| Dark Navy | `#0f172a` → `#1e293b` | S2S card (dark gradient) |
| Dark Red | `#7f1d1d` → `#991b1b` | S2S card over budget |

### **Dimensions hardcoded**

| Element | Value | File |
|---------|-------|------|
| Sidebar expanded | `260px` | `Layout.tsx` |
| Sidebar collapsed | `80px` | `Layout.tsx` |
| Header height | `80px` | `Layout.tsx` |
| S2S Hero min-height | `min-h-[210px]` | `Dashboard.tsx` |
| MetricCard (demoted) padding | `p-3` (12px compact) | `Dashboard.tsx` |
| MetricCard (demoted) bg | `#F9FAFB` (gray-50) | `Dashboard.tsx` |

### **Font**

- **Font chính:** Inter (Google Fonts)
- **Import:** `/src/styles/fonts.css`
- **Base size:** 16px
- **Fallback:** `Inter, system-ui, sans-serif`

---

## 🔄 WORKFLOW PHÁT TRIỂN

### **Phase đã hoàn thành:**

1. ✅ **Setup project** (Vite + React + TypeScript + Tailwind v4)
2. ✅ **Design system** (Tokens, colors, components)
3. ✅ **Routing architecture** (React Router Data mode)
4. ✅ **Layout shell** (Sidebar + Header + FAB)
5. ✅ **8 pages UI/UX** (Login → Settings)
6. ✅ **Mock data layer** (mockData.ts)
7. ✅ **API Client structure** (api.ts + useAPI.ts hooks)
8. ✅ **Charts integration** (Recharts + fix duplicate keys)
9. ✅ **Animation** (Motion/Framer throughout)
10. ✅ **Wireframes document** (Lo-fi prototype với annotations)
11. ✅ **Antigravity V1.2 UX fix** (Dashboard hierarchy)
12. ✅ **[v11.0] Architecture Audit** (Phát hiện mâu thuẫn Express vs Hono stack)
13. ✅ **[v11.0] Đại Phẫu SYSTEM_ARCHITECTURE.md** (Monorepo, Hono.js, TiDB, Drizzle, Clean Arch)
14. ✅ **[v11.0] Đại Phẫu DATABASE_ALL.md** (Xóa Views/SP/Triggers, giữ Tables + Drizzle ORM schemas)
15. ✅ **[v11.0] Cập nhật CHANGELOG_AND_SUMMARY.md**

### **Phase tiếp theo (Backend MVP — Monorepo Turborepo):**

1. ⏳ Init Turborepo Monorepo (`pnpm dlx create-turbo`)
2. ⏳ Tạo TiDB Serverless cluster (TiDB Cloud console)
3. ⏳ Setup `packages/db` (Drizzle schemas + migrations)
4. ⏳ Chạy `pnpm db:migrate` lần đầu
5. ⏳ Setup `apps/api` Hono.js + Vercel Edge
6. ⏳ Setup `packages/shared-schemas` Zod
7. ⏳ Implement JWT Auth (dùng Jose — Web Crypto compatible)
8. ⏳ Implement S2S Engine TypeScript (`calculateSafeToSpend`)
9. ⏳ Implement `initializeNewUser` service (thay Trigger)
10. ⏳ CRUD Transactions, Goals, Bills, Categories APIs
11. ⏳ Connect frontend (bật `USE_REAL_API = true`)
12. ⏳ Deploy (`vercel deploy` — không cần Nginx/PM2)

---

## 🚀 KẾ HOẠCH TRIỂN KHAI

### **Immediate (Infrastructure Setup — Tuần 1):**
- [ ] Init Turborepo Monorepo
- [ ] Tạo TiDB Serverless cluster (free tier — tidbcloud.com)
- [ ] Setup `packages/db` với Drizzle ORM
- [ ] Chạy `pnpm db:migrate` để tạo 12 tables

### **Short-term (Backend MVP — Tuần 2-3):**
- [ ] Setup `apps/api` Hono.js + `vercel.json`
- [ ] Implement JWT auth (Jose — không phải jsonwebtoken)
- [ ] Implement S2S Engine (`calculateSafeToSpend` in-memory TypeScript)
- [ ] CRUD Transactions API
- [ ] Connect frontend (bật `USE_REAL_API = true`)

### **Mid-term (Core Features — Tuần 4-5):**
- [ ] CRUD Goals + `checkAndCompleteGoal` service
- [ ] CRUD Bills + `generateBillPaymentsForMonth` service
- [ ] Dashboard summary API
- [ ] Cash wallet sync service (`wallet-service.ts`)
- [ ] `initializeNewUser` service (thay trigger `trg_after_user_insert`)

### **Mid-term (AI & Automation — Tháng 2):**
- [ ] Quick-Add NLP (OpenAI API — "ăn sáng 30k")
- [ ] OCR Receipt scan (Google Vision API)
- [ ] Bill due reminders (Vercel Cron Jobs — không phải Bull/BullMQ)
- [ ] Email notifications (Resend — không phải Nodemailer)
- [ ] Migrate `apps/web` từ Vite prototype → Next.js 14 App Router

### **Long-term (Polish & Scale — Tháng 3+):**
- [ ] Dark mode toggle UI
- [ ] Export CSV/PDF báo cáo
- [ ] PWA setup (service worker + manifest)
- [ ] Performance optimization
- [ ] Production deployment (`vercel deploy` — không cần Nginx/PM2)

---

## 📝 NOTES & LESSONS LEARNED

### **Antigravity V1.2 Insights:**

1. **S2S must be THE ONLY visual anchor**
   - Không có gì chen trước nó (kể cả banner AI chat)
   - Full-width, tối thiểu 2.5x height của cards phụ
   - Dark theme để tạo contrast mạnh

2. **3 metrics kế toán phải bị hạ cấp THỰC SỰ**
   - Không chỉ "di chuyển xuống hàng 2"
   - Phải giảm size, giảm saturation, giảm prominence
   - Loại bỏ icons nổi bật, loại bỏ trend badges

3. **Cash Wallet không được dính Bills**
   - Riêng biệt hoàn toàn, dải ngang mỏng
   - Màu amber nhẹ, "Quick Sync" là action duy nhất

### **Recharts Best Practices:**

1. Đặt `key` trên `<Bar>`, `<Line>`, `<Pie>` (không phải primitives)
2. Dùng `isAnimationActive={false}` để tránh re-render conflicts
3. `<Cell>` trong `<Pie>` PHẢI có unique key: `key={cell-${name}-${index}}`

### **Clean Architecture for Serverless — Key Insights:**

1. **Triggers = Hidden side effects** → Không thể unit test, không thể trace từ code
2. **Stored Procedures = Logic phân tán** → Không version-controlled đúng cách, không migrate được
3. **Views với business logic = Coupled tightly to DB** → Không thể mock khi test
4. **Hono.js services = Testable, typesafe, versionable** → Đây là nơi logic phải sống
5. **TiDB HTTP Driver = Edge-compatible** → TCP sockets không hoạt động trên Vercel Edge Runtime

### **Why Vercel Edge over Traditional Server:**

```
Express + Nginx + PM2  →  Manual scaling, SSH deploy, constant cost
Hono.js + Vercel Edge  →  Auto-scale, git push deploy, pay-per-request
```

---

## 📞 THÔNG TIN DỰ ÁN

**Dự án:** S2S Finance — Finance Tracker V3 (Antigravity V1.2 Protocol)
**Phiên bản:** 11.0 (Frontend-complete + Architecture Docs Overhauled)
**Ngày cập nhật cuối:** 1 tháng 4, 2026

**Tài liệu tham khảo:**
- `/SYSTEM_ARCHITECTURE.md` — Kiến trúc Monorepo Turborepo đầy đủ (v11.0)
- `/DATABASE_ALL.md` — TiDB Serverless Tables + Drizzle ORM schemas (v11.0, no Views/SP/Triggers)
- `/src/app/pages/Wireframes.tsx` — Lo-fi wireframe 8 màn hình

---

*Tài liệu này được tạo tự động từ phân tích codebase và quá trình phát triển. Cập nhật khi có thay đổi kiến trúc hoặc fix mới. Version 11.0 phản ánh quyết định kiến trúc chính thức: **Monorepo Turborepo + Hono.js + Vercel Edge + TiDB Serverless + Drizzle ORM**.*
