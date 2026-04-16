/**
 * UserFlows — Finance Tracker V3 UX Documentation
 * 5 luồng người dùng chính được visualize dưới dạng flow diagram tương tác.
 * Trang này phục vụ test UX flow TRƯỚC khi wire backend.
 *
 * Flows:
 *  1. Nhập Chi Tiêu Hàng Ngày      (most common)
 *  2. Nhập Thu Nhập                (income entry)
 *  3. Quick Sync Ví Tiền Mặt       (cash wallet concern)
 *  4. Chuyển Khoản                 (transfer — directionless concern)
 *  5. Đóng Góp Mục Tiêu            (savings goal — double-dip concern)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap, TrendingDown, TrendingUp, Wallet, Target, ArrowRight,
  ArrowLeftRight, AlertTriangle, CheckCircle, Info, ChevronRight,
  User, Server, Database, Activity, Shield,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Actor = "user" | "system" | "api" | "db";

interface FlowStep {
  id: number;
  actor: Actor;
  title: string;
  desc: string;
  icon: string;
  details?: string[];
  warning?: string;
  concern?: string;
  isTerminal?: boolean;
  stateChange?: string;
}

interface UserFlow {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  trigger: string;
  frequency: string;
  desc: string;
  concern?: string;
  steps: FlowStep[];
  apiEndpoints: string[];
  zodValidations: string[];
}

// ─── Flow Data ────────────────────────────────────────────────────────────────
const flows: UserFlow[] = [
  // ── Flow 1: Add Expense ────────────────────────────────────────────────────
  {
    id: "expense",
    name: "Nhập Chi Tiêu",
    emoji: "💸",
    color: "#6366f1",
    bgColor: "rgba(99,102,241,0.08)",
    borderColor: "rgba(99,102,241,0.2)",
    trigger: "User muốn ghi nhận một khoản chi tiêu tự do",
    frequency: "Hàng ngày (most common)",
    desc: "Luồng phổ biến nhất. User nhập chi tiêu → S2S tự động cập nhật.",
    steps: [
      { id: 1, actor: "user", title: "Mở App / Dashboard", icon: "📱", desc: "User thấy S2S Hero Section. Con số \"Còn lại\" là thứ đầu tiên user nhìn thấy.", details: ["S2S Hero hiển thị số dư khả dụng", "3 metric cards bên dưới (subdued)", "Cash Wallet strip riêng biệt"] },
      { id: 2, actor: "user", title: "Nhấn nút + (FAB)", icon: "➕", desc: "Floating Action Button ở góc phải dưới. Hoặc nhập qua Chat AI.", details: ["QuickAddModal mở ra", "Hoặc ChatQuickAdd với NLP"] },
      { id: 3, actor: "user", title: "Chọn loại: Chi tiêu", icon: "🏷️", desc: "Chọn category (Ăn Uống / Đồ Uống / Di Chuyển / Khác)", details: ["Category ảnh hưởng đến analytics", "Không ảnh hưởng S2S calculation", "S2S chỉ dùng tổng chi tiêu discretionary"] },
      { id: 4, actor: "user", title: "Nhập số tiền & mô tả", icon: "⌨️", desc: "\"Cafe sáng 35k\" — Chat AI parse hoặc form truyền thống.", details: ["Amount (required)", "Note (optional)", "Date (default: hôm nay)", "Wallet source (default: main)"] },
      { id: 5, actor: "api", title: "POST /transactions", icon: "🔌", desc: "Hono.js route nhận request, validate, calculate S2S impact.", details: ["Zod: amount > 0, type = expense", "Ghi vào transactions table", "S2S recalculation trigger"], stateChange: "DB: new transaction row", },
      { id: 6, actor: "system", title: "S2S Recalculation", icon: "🧮", desc: "Backend tính lại S2S Remaining = Budget − SUM(discretionary expenses this period)", details: ["Không kể fixed expenses (đã deducted)", "Không kể savings transfers (đã deducted)", "Chỉ tính chi tiêu tự do trong kỳ"], stateChange: "s2s_remaining giảm đi amount vừa nhập" },
      { id: 7, actor: "system", title: "UI cập nhật realtime", icon: "✅", desc: "S2S Hero Section animation cập nhật số dư mới. Ring chart animate.", isTerminal: true, stateChange: "S2S Remaining = old − amount" },
    ],
    apiEndpoints: ["POST /api/transactions", "GET /api/s2s/summary"],
    zodValidations: ["amount: z.number().positive()", "type: z.enum(['expense','income'])", "category_id: z.number().optional()", "wallet_id: z.number().default(1)"],
  },

  // ── Flow 2: Add Income ─────────────────────────────────────────────────────
  {
    id: "income",
    name: "Nhập Thu Nhập",
    emoji: "💰",
    color: "#10b981",
    bgColor: "rgba(16,185,129,0.08)",
    borderColor: "rgba(16,185,129,0.2)",
    trigger: "User nhận lương / thưởng / thu nhập ngoài",
    frequency: "1-3 lần/tháng",
    desc: "Nhập thu nhập kích hoạt recalculation S2S budget cho tháng. Đặc biệt quan trọng khi nhận lương ngày 5.",
    steps: [
      { id: 1, actor: "user", title: "Mở Quick Add / Chat", icon: "📱", desc: "User nhấn FAB hoặc mở Chat AI.", details: ["Chat: \"Lương tháng 4 / 25 triệu\"", "Form: Chọn loại Thu Nhập"] },
      { id: 2, actor: "user", title: "Chọn loại: Thu Nhập", icon: "💰", desc: "Income type bắt buộc để backend phân biệt income vs expense.", details: ["Lương thường xuyên", "Thưởng / bonus", "Thu nhập phụ / freelance", "Bán đồ cũ / vãng lai"] },
      { id: 3, actor: "user", title: "Nhập amount & source", icon: "⌨️", desc: "Số tiền + mô tả nguồn thu. Chọn ví đích (bank / cash).", details: ["Nếu là cash → không auto-sync Cash Wallet", "User phải Quick Sync riêng", "Bank income → auto visible trong balance"] },
      { id: 4, actor: "api", title: "POST /transactions (income)", icon: "🔌", desc: "Backend nhận income transaction, validate, recalculate monthly S2S budget.", details: ["type = 'income'", "Nếu là 'salary' type → trigger S2S budget reset", "Cộng vào total_income của tháng"] },
      { id: 5, actor: "system", title: "S2S Budget Recalc", icon: "🧮", desc: "S2S Budget = total_income − fixed_expenses − savings_commitment − buffer. Thu nhập tăng → S2S Budget tăng.", stateChange: "s2s_budget tăng lên", details: ["Lương tháng sau nhận ngày income_date", "Budget được reset mỗi income cycle", "Antigravity V1.2: buffer = 6% income"] },
      { id: 6, actor: "system", title: "Dashboard cập nhật", icon: "✅", desc: "S2S Hero hiển thị budget mới. Balance tăng. 3 metric cards cập nhật.", isTerminal: true, stateChange: "total_income tăng, s2s_budget tăng" },
    ],
    apiEndpoints: ["POST /api/transactions", "GET /api/s2s/summary", "GET /api/finance/overview"],
    zodValidations: ["amount: z.number().positive()", "type: z.literal('income')", "income_source: z.enum(['salary','bonus','side','misc']).optional()"],
  },

  // ── Flow 3: Cash Wallet Sync ───────────────────────────────────────────────
  {
    id: "cashsync",
    name: "Quick Sync Ví Mặt",
    emoji: "💵",
    color: "#f59e0b",
    bgColor: "rgba(245,158,11,0.08)",
    borderColor: "rgba(245,158,11,0.2)",
    trigger: "User muốn đồng bộ số dư ví tiền mặt sau khi chi tiêu lặt vặt",
    frequency: "2-4 lần/tuần",
    desc: "Ví tiền mặt TÁCH BIỆT khỏi S2S. Cash flow không qua bank → không tự động track. Quick Sync là mechanism để \"đối soát\".",
    concern: "Cash Wallet Concern: Chi tiêu bằng tiền mặt không xuất hiện trong transaction feed bình thường. Risk: Double-counting nếu cả hai được record.",
    steps: [
      { id: 1, actor: "user", title: "Xem Cash Wallet Strip", icon: "👁️", desc: "Dải amber ở hàng 3 Dashboard. User thấy số dư ví tiền mặt hiện tại.", details: ["Dải nằm ngang — cô lập hoàn toàn", "Hiển thị balance + thời gian sync cuối", "Badge: Không tính vào S2S"] },
      { id: 2, actor: "user", title: "Nhấn Quick Sync", icon: "⚡", desc: "Modal mở ra. User đếm tiền thực tế trong ví.", details: ["Modal lightweight, không fullscreen", "Hiện số dư cũ vs mới", "Preview chi phí lặt vặt"] },
      { id: 3, actor: "user", title: "Nhập số tiền thực", icon: "⌨️", desc: "\"Trong ví hiện có bao nhiêu?\" — User nhập số tiền đang có.", details: ["Nếu nhỏ hơn trước → diff = tiền đã tiêu", "Nếu lớn hơn → user nạp thêm cash", "Không thể âm"] },
      { id: 4, actor: "system", title: "Tính diff & preview", icon: "🧮", desc: "App tính: spent = old_balance − new_balance. Hiển thị preview trước khi confirm.", details: ["diff > 0 → sẽ tạo \"Chi phí không tên\"", "diff < 0 → chỉ cập nhật balance", "diff = 0 → không làm gì"] },
      { id: 5, actor: "api", title: "PATCH /wallets/cash", icon: "🔌", desc: "Cập nhật cash_wallet.balance. Nếu có diff > 0, tạo transaction \"Chi phí không tên\".", details: ["wallet_type = 'cash'", "Transaction type = 'expense'", "Category = 'misc'", "Source = 'cash_sync'"], warning: "Concern: transaction này KHÔNG tính vào S2S nếu cash không nằm trong S2S scope. API cần flag đúng." },
      { id: 6, actor: "db", title: "Ghi vào DB", icon: "💾", desc: "cash_wallets.balance được update. Nếu có transaction → insert vào transactions.", stateChange: "cash_balance updated, optional misc transaction" },
      { id: 7, actor: "system", title: "Strip cập nhật", icon: "✅", desc: "CashWalletStrip hiển thị balance mới + timestamp sync.", isTerminal: true },
    ],
    apiEndpoints: ["PATCH /api/wallets/cash", "POST /api/transactions (misc)", "GET /api/wallets"],
    zodValidations: ["new_balance: z.number().nonnegative()", "sync_note: z.string().optional()"],
  },

  // ── Flow 4: Transfer ───────────────────────────────────────────────────────
  {
    id: "transfer",
    name: "Chuyển Khoản",
    emoji: "↔️",
    color: "#8b5cf6",
    bgColor: "rgba(139,92,246,0.08)",
    borderColor: "rgba(139,92,246,0.2)",
    trigger: "User chuyển tiền giữa các ví (Bank → Cash, Bank → Savings, ...)",
    frequency: "1-2 lần/tuần",
    desc: "Transfer là luồng phức tạp nhất. DATABASE_ALL.md v12.0 đã xác định điểm mù: Transfer directionless — schema lưu amount nhưng không biết source/destination rõ ràng.",
    concern: "🔴 ĐIỂM MÙ #1 (DATABASE_ALL.md v12.0): Transfer directionless. Schema hiện tại không enforce direction. API Layer (Hono.js) phải validate: source_wallet ≠ dest_wallet, source có đủ balance không, loại transfer (bank→cash / bank→goal / internal).",
    steps: [
      { id: 1, actor: "user", title: "Khởi tạo Transfer", icon: "↔️", desc: "User nhấn + → Chọn \"Chuyển khoản\" (Transfer type).", details: ["FAB → Transfer option", "Chọn source wallet", "Chọn destination wallet"] },
      { id: 2, actor: "user", title: "Chọn Source & Dest", icon: "🔄", desc: "Source Wallet → Destination Wallet. Đây là phần API phải enforce direction.", details: ["Danh sách wallets của user", "Cash wallet có thể là source hoặc dest", "Goal wallets chỉ là destination"], warning: "Concern: Nếu user chọn cùng một ví cho source và dest → API phải reject" },
      { id: 3, actor: "user", title: "Nhập số tiền", icon: "⌨️", desc: "Amount + optional note. API check balance của source trước khi proceed.", details: ["Amount ≤ source.balance", "Note: \"Chuyển sang quỹ iPhone\""] },
      { id: 4, actor: "api", title: "POST /transfers (validate)", icon: "🔌", desc: "Hono.js validate direction + balance. Tạo 2 transactions: debit từ source, credit vào dest.", details: ["source_wallet_id ≠ dest_wallet_id (Zod refine)", "source.balance ≥ amount", "Atomic: 2 transactions trong 1 DB transaction"], concern: "API tạo paired transactions. Cả 2 phải thành công hoặc rollback toàn bộ. Logic này ở API layer, không ở DB layer." },
      { id: 5, actor: "system", title: "S2S Impact Check", icon: "🧮", desc: "Transfer bank→bank KHÔNG ảnh hưởng S2S (chỉ move tiền). Transfer bank→cash có thể tạo Cash sync issue.", stateChange: "2 wallets balances thay đổi, S2S unchanged" },
      { id: 6, actor: "db", title: "Atomic Write", icon: "💾", desc: "Ghi 2 transactions linked by transfer_id. Nếu fail → rollback cả 2.", stateChange: "source.balance − amount, dest.balance + amount" },
      { id: 7, actor: "system", title: "Confirm & Update UI", icon: "✅", desc: "User thấy confirmation. Wallet balances cập nhật. Cash Wallet Strip cập nhật nếu liên quan.", isTerminal: true },
    ],
    apiEndpoints: ["POST /api/transfers", "GET /api/wallets", "GET /api/wallets/:id/balance"],
    zodValidations: ["source_wallet_id: z.number()", "dest_wallet_id: z.number()", "amount: z.number().positive()", "z.refine(d => d.source_wallet_id !== d.dest_wallet_id, 'Cannot transfer to same wallet')"],
  },

  // ── Flow 5: Goal Contribution ──────────────────────────────────────────────
  {
    id: "goal",
    name: "Đóng Góp Mục Tiêu",
    emoji: "🎯",
    color: "#f43f5e",
    bgColor: "rgba(244,63,94,0.08)",
    borderColor: "rgba(244,63,94,0.2)",
    trigger: "User đóng góp tiền vào savings goal (manual hoặc auto)",
    frequency: "1 lần/tháng (auto) hoặc bất cứ lúc nào",
    desc: "Goal contribution đã được deduct trong S2S formula (savings_commitment). Nếu record thêm transaction → sẽ bị double-count.",
    concern: "🔴 ĐIỂM MÙ #2 (DATABASE_ALL.md v12.0): Bill/Transaction Double-Dip. Savings commitment đã trừ khỏi S2S budget. Nếu user còn tạo expense transaction cho cùng khoản → S2S bị tính 2 lần. API phải detect và block hoặc warn.",
    steps: [
      { id: 1, actor: "user", title: "Xem Goals Page", icon: "🎯", desc: "User thấy danh sách goals với progress bar.", details: ["iPhone 16 Pro: 34%", "Du lịch Nhật: 60%", "Quỹ Khẩn Cấp: 100% ✅"] },
      { id: 2, actor: "user", title: "Nhấn \"Đóng Góp\"", icon: "➕", desc: "Nút trên goal card. Hoặc auto-contribution vào ngày income_date.", details: ["Manual: User nhập số tiền bất kỳ", "Auto: monthly_contribution từ goal config", "Vượt target → blocked"] },
      { id: 3, actor: "api", title: "POST /goals/:id/contribute", icon: "🔌", desc: "Hono.js validate: đây là khoản đã nằm trong savings_commitment hay chưa?", concern: "Double-Dip Check: Nếu monthly_contribution đã được tính trong S2S deduction → khoản này KHÔNG phải expense S2S. API phải flag contribution_source = 'commitment' để UI không show như expense.", details: ["contribution_amount: z.number().positive()", "Check: total_contributed_this_month ≤ monthly_commitment", "Flag: is_commitment_based (boolean)"] },
      { id: 4, actor: "system", title: "Double-Dip Guard", icon: "🛡️", desc: "Nếu đóng góp = cam kết tháng → không tạo expense transaction mới. Nếu đóng góp > cam kết → phần vượt cần record là expense.", stateChange: "goal.current_saved + amount", details: ["commitment amount → không record transaction mới", "excess amount → record như expense (S2S impacted)", "Toàn bộ logic ở API layer, không ở DB"], warning: "Antigravity V1.2: DB là 'dumb storage'. Logic guard ở tầng API." },
      { id: 5, actor: "db", title: "Update goal_savings", icon: "💾", desc: "goal_savings.current_saved tăng lên. Nếu completed → status = 'completed'.", stateChange: "goals.current_saved + amount, maybe status = completed" },
      { id: 6, actor: "system", title: "Goals Page & S2S Update", icon: "✅", desc: "Progress bar animate. Nếu completed → celebration confetti. S2S chỉ thay đổi nếu extra contribution.", isTerminal: true, stateChange: "goal progress updated, S2S unchanged (if commitment)" },
    ],
    apiEndpoints: ["POST /api/goals/:id/contribute", "GET /api/goals", "GET /api/s2s/summary"],
    zodValidations: ["goal_id: z.number()", "amount: z.number().positive()", "note: z.string().optional()", "is_manual: z.boolean().default(false)"],
  },
];

// ─── Actor Badge ──────────────────────────────────────────────────────────────
function ActorBadge({ actor }: { actor: Actor }) {
  const config: Record<Actor, { label: string; color: string; Icon: any }> = {
    user:   { label: "User",   color: "#3b82f6", Icon: User },
    system: { label: "System", color: "#8b5cf6", Icon: Activity },
    api:    { label: "API",    color: "#f59e0b", Icon: Server },
    db:     { label: "DB",     color: "#6b7280", Icon: Database },
  };
  const c = config[actor];
  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{ background: `${c.color}15`, border: `1px solid ${c.color}30` }}
    >
      <c.Icon size={9} style={{ color: c.color }} />
      <span className="text-[9px] font-bold" style={{ color: c.color }}>{c.label}</span>
    </div>
  );
}

// ─── Flow Step Card ───────────────────────────────────────────────────────────
function StepCard({
  step,
  isLast,
  flowColor,
  isSelected,
  onClick,
}: {
  step: FlowStep;
  isLast: boolean;
  flowColor: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-44 lg:w-48 cursor-pointer"
      >
        {/* Step number */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
            style={{ background: isSelected ? flowColor : "#d1d5db" }}
          >
            {step.id}
          </div>
          <ActorBadge actor={step.actor} />
        </div>

        {/* Card body */}
        <div
          className="rounded-2xl p-3.5 border transition-all"
          style={{
            background: isSelected ? `${flowColor}10` : "white",
            borderColor: isSelected ? flowColor : "#e5e7eb",
            boxShadow: isSelected ? `0 4px 16px ${flowColor}20` : "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div className="text-xl mb-2">{step.icon}</div>
          <p className="text-[12px] font-bold text-gray-900 leading-snug mb-1">{step.title}</p>
          <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{step.desc}</p>

          {step.stateChange && (
            <div className="mt-2 px-2 py-1 rounded-lg"
              style={{ background: `${flowColor}10`, border: `1px solid ${flowColor}20` }}>
              <p className="text-[9px] font-bold" style={{ color: flowColor }}>
                → {step.stateChange}
              </p>
            </div>
          )}

          {step.warning && (
            <div className="mt-2 flex items-start gap-1 px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle size={9} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[9px] text-amber-700 font-semibold">{step.warning}</p>
            </div>
          )}

          {step.isTerminal && (
            <div className="mt-2 flex items-center gap-1">
              <CheckCircle size={10} className="text-emerald-500" />
              <span className="text-[9px] font-bold text-emerald-600">Flow kết thúc</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Arrow */}
      {!isLast && (
        <div className="flex items-center justify-center h-8 w-full mt-2 mb-0">
          <div className="w-px h-6 border-l-2 border-dashed" style={{ borderColor: "#d1d5db" }} />
        </div>
      )}
    </div>
  );
}

// ─── Step Detail Panel ────────────────────────────────────────────────────────
function StepDetailPanel({ step, flowColor }: { step: FlowStep; flowColor: string }) {
  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="h-full"
    >
      <div
        className="rounded-2xl p-5 h-full"
        style={{
          background: `${flowColor}08`,
          border: `1.5px solid ${flowColor}25`,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{step.icon}</span>
          <div>
            <p className="text-[16px] font-black text-gray-900">{step.title}</p>
            <ActorBadge actor={step.actor} />
          </div>
        </div>

        <p className="text-[13px] text-gray-700 leading-relaxed mb-4">{step.desc}</p>

        {step.details && step.details.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Chi tiết</p>
            <ul className="space-y-1.5">
              {step.details.map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight size={11} className="flex-shrink-0 mt-0.5" style={{ color: flowColor }} />
                  <span className="text-[12px] text-gray-600">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step.concern && (
          <div className="p-3 rounded-xl mb-3" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <p className="text-[11px] text-red-700 font-semibold leading-relaxed">{step.concern}</p>
          </div>
        )}

        {step.stateChange && (
          <div className="p-3 rounded-xl"
            style={{ background: `${flowColor}10`, border: `1px solid ${flowColor}25` }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: flowColor }}>
              State Change
            </p>
            <p className="text-[12px] font-semibold text-gray-800">{step.stateChange}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function UserFlows() {
  const [activeFlow, setActiveFlow] = useState(flows[0].id);
  const [selectedStep, setSelectedStep] = useState<FlowStep | null>(null);

  const flow = flows.find((f) => f.id === activeFlow)!;

  const handleSelectFlow = (id: string) => {
    setActiveFlow(id);
    setSelectedStep(null);
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-20">
      {/* ── Page header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-black text-gray-900">User Flows</h1>
            <p className="text-[13px] text-gray-500">Finance Tracker V3 · UX Testing trước khi wire backend</p>
          </div>
        </div>

        {/* Architecture note */}
        <div className="mt-4 flex items-start gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
          <Shield size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-bold text-indigo-700 mb-1">
              Antigravity V1.2 · Clean Architecture
            </p>
            <p className="text-[11px] text-indigo-600 leading-relaxed">
              DB = "dumb storage". Toàn bộ business logic (S2S calc, Double-Dip guard, Transfer direction) ở tầng API (Hono.js).
              2 điểm mù đã được xác định trong DATABASE_ALL.md v12.0: <strong>Transfer directionless</strong> + <strong>Bill/Transaction Double-Dip</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Flow tabs ── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {flows.map((f) => (
          <motion.button
            key={f.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelectFlow(f.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-[13px] transition-all"
            style={{
              background: activeFlow === f.id ? f.bgColor : "white",
              borderColor: activeFlow === f.id ? f.borderColor : "#e5e7eb",
              color: activeFlow === f.id ? f.color : "#6b7280",
              boxShadow: activeFlow === f.id ? `0 4px 16px ${f.color}20` : "none",
            }}
          >
            <span>{f.emoji}</span>
            <span>{f.name}</span>
            {f.concern && (
              <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" title="Có điểm mù logic" />
            )}
          </motion.button>
        ))}
      </div>

      {/* ── Flow content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={flow.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          {/* Flow meta */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
            <div className="lg:col-span-8">
              <div
                className="rounded-2xl p-5 border"
                style={{ background: flow.bgColor, borderColor: flow.borderColor }}
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-2xl">{flow.emoji}</span>
                      <h2 className="text-[18px] font-black" style={{ color: flow.color }}>{flow.name}</h2>
                      {flow.concern && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">
                          ⚠️ Điểm mù logic
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-gray-700 leading-relaxed max-w-lg">{flow.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tần suất</p>
                    <p className="text-[12px] font-bold" style={{ color: flow.color }}>{flow.frequency}</p>
                  </div>
                </div>

                {flow.concern && (
                  <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-[11px] text-red-700 font-semibold leading-relaxed">{flow.concern}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trigger:</span>
                  <span className="text-[11px] text-gray-600 font-semibold">{flow.trigger}</span>
                </div>
              </div>
            </div>

            {/* API + Zod */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-gray-900 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">API Endpoints</p>
                {flow.apiEndpoints.map((ep) => (
                  <p key={ep} className="text-[11px] font-mono text-emerald-400 leading-relaxed">{ep}</p>
                ))}
              </div>
              <div className="bg-gray-900 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Zod Validation</p>
                {flow.zodValidations.map((z) => (
                  <p key={z} className="text-[10px] font-mono text-blue-400 leading-relaxed">{z}</p>
                ))}
              </div>
            </div>
          </div>

          {/* ── Step flow diagram + detail ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Flow diagram — scrollable horizontal on mobile */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-x-auto">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-5">
                  Flow Diagram · {flow.steps.length} bước · Nhấn vào step để xem chi tiết
                </p>

                {/* Horizontal flow on large screens */}
                <div className="hidden lg:flex items-start gap-0">
                  {flow.steps.map((step, i) => (
                    <div key={step.id} className="flex items-start">
                      {/* Step card */}
                      <div
                        className="w-40 xl:w-44 cursor-pointer group"
                        onClick={() => setSelectedStep(selectedStep?.id === step.id ? null : step)}
                      >
                        {/* Number + Actor */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 transition-all"
                            style={{ background: selectedStep?.id === step.id ? flow.color : "#9ca3af" }}
                          >
                            {step.id}
                          </div>
                          <ActorBadge actor={step.actor} />
                        </div>

                        <motion.div
                          whileHover={{ y: -3 }}
                          className="rounded-xl p-3 border transition-all"
                          style={{
                            background: selectedStep?.id === step.id ? `${flow.color}0d` : "#fafafa",
                            borderColor: selectedStep?.id === step.id ? flow.color : "#e5e7eb",
                            boxShadow: selectedStep?.id === step.id ? `0 4px 14px ${flow.color}20` : "none",
                          }}
                        >
                          <div className="text-lg mb-1.5">{step.icon}</div>
                          <p className="text-[11px] font-bold text-gray-900 leading-tight mb-1">{step.title}</p>
                          <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">{step.desc}</p>

                          {step.stateChange && (
                            <div className="mt-2 px-1.5 py-1 rounded-lg"
                              style={{ background: `${flow.color}12`, border: `1px solid ${flow.color}22` }}>
                              <p className="text-[8px] font-bold leading-tight" style={{ color: flow.color }}>
                                {step.stateChange}
                              </p>
                            </div>
                          )}

                          {step.warning && (
                            <div className="mt-1.5 flex items-start gap-1">
                              <AlertTriangle size={8} className="text-amber-500 flex-shrink-0 mt-0.5" />
                              <p className="text-[8px] text-amber-600 font-semibold">{step.warning}</p>
                            </div>
                          )}

                          {step.isTerminal && (
                            <div className="mt-1.5 flex items-center gap-1">
                              <CheckCircle size={9} className="text-emerald-500" />
                              <span className="text-[8px] font-bold text-emerald-600">Kết thúc</span>
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {/* Arrow between steps */}
                      {i < flow.steps.length - 1 && (
                        <div className="flex items-center pt-8 px-1 flex-shrink-0">
                          <ArrowRight size={14} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Vertical flow on mobile */}
                <div className="flex lg:hidden flex-col gap-0">
                  {flow.steps.map((step, i) => (
                    <StepCard
                      key={step.id}
                      step={step}
                      isLast={i === flow.steps.length - 1}
                      flowColor={flow.color}
                      isSelected={selectedStep?.id === step.id}
                      onClick={() => setSelectedStep(selectedStep?.id === step.id ? null : step)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-4">
              <AnimatePresence mode="wait">
                {selectedStep ? (
                  <StepDetailPanel
                    key={selectedStep.id}
                    step={selectedStep}
                    flowColor={flow.color}
                  />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-gray-200"
                    style={{ minHeight: 300 }}
                  >
                    <div className="text-4xl mb-3">{flow.emoji}</div>
                    <p className="text-[13px] font-bold text-gray-400 mb-1">Chọn một bước</p>
                    <p className="text-[11px] text-gray-300">Nhấn vào step trong flow diagram để xem chi tiết</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Legend ── */}
          <div className="mt-4 flex items-center gap-6 flex-wrap">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Actor Legend:</p>
            {([
              { actor: "user" as Actor, label: "User Action" },
              { actor: "api" as Actor, label: "API (Hono.js)" },
              { actor: "system" as Actor, label: "System Logic" },
              { actor: "db" as Actor, label: "Database (TiDB)" },
            ]).map(({ actor, label }) => (
              <div key={actor} className="flex items-center gap-1.5">
                <ActorBadge actor={actor} />
                <span className="text-[10px] text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
