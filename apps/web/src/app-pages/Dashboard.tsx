"use client";
/**
 * Dashboard — Finance Tracker V3
 * Layout order (Antigravity V1.2):
 *  HÀNG 1 — S2S Hero (full-width, dark, ~2.5× card phụ)
 *  HÀNG 2 — 3 Metric Cards (demoted, subdued)
 *  HÀNG 3 — Cash Wallet Strip (isolated horizontal)
 *  HÀNG 4 — Transactions + Goals (left 8/12) | Bills (right 4/12)
 */

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Target,
  Calendar,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { motion, type Variants } from "motion/react";
import Link from "next/link";
import {
  formatVND,
} from "../data/mockData";
import ChatQuickAdd from "../components/ChatQuickAdd";
import { S2SHeroSection } from "../components/S2SHeroSection";
import { CashWalletStrip } from "../components/CashWalletStrip";
import { useFinanceData, useTransactions, useGoals, useBills, useCreateTransaction } from "../hooks/useAPI";
import { Skeleton } from "../components/ui/skeleton";

// ─── Subdued Metric Card ──────────────────────────────────────────────────────
// Theo wireframe: "HÀNG 2 — CHỈ SỐ KẾ TOÁN BỊ HẠ CẤP (DEMOTED)"
// Không icon nổi bật, không badge %, nền xám nhạt nhất, số mờ.
function SubduedMetricCard({
  title,
  amount,
  icon,
  note,
}: {
  title: string;
  amount: number;
  icon: React.ReactNode;
  note?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="relative bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100/80 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-300 overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">{title}</p>
        <div className="text-gray-300 group-hover:text-gray-400 transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-[22px] font-bold text-gray-600 tracking-tight">
        {formatVND(amount)}
      </p>
      {note && (
        <p className="text-[10px] text-gray-400 mt-1 font-medium">{note}</p>
      )}
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [cashBalance, setCashBalance] = useState(1_500_000);

  const { data: financeData, loading: financeLoading, refetch: refetchFinance } = useFinanceData();
  const { data: txData, loading: txLoading, refetch: refetchTx } = useTransactions({ limit: 6 });
  const { data: goals, loading: goalsLoading } = useGoals();
  const { data: bills, loading: billsLoading } = useBills();
  const { create: quickAdd } = useCreateTransaction();

  const handleQuickAdd = async (transaction: any) => {
    try {
      // Use the raw input or a formatted string from the parsed transaction
      await quickAdd(transaction.note + " " + transaction.amount);
      refetchFinance();
      refetchTx();
      setIsChatOpen(false);
    } catch (err) {
      console.error("Quick add failed:", err);
    }
  };

  const handleCashSync = (newBalance: number, spent: number) => {
    setCashBalance(newBalance);
    if (spent > 0) {
      console.log(`Cash sync: spent ${spent}₫ → create misc transaction`);
    }
  };

  const isLoading = financeLoading || txLoading;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } as const },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } as const },
  };

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6 pt-4">
        <Skeleton className="h-[240px] w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const recentTx = txData?.transactions || [];

  return (
    <>
      <ChatQuickAdd
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onAdd={handleQuickAdd}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-[1400px] mx-auto space-y-4 pb-24"
      >
        {/* ══════════════════════════════════════════════════════════════════
            HÀNG 1 — S2S HERO (FULL-WIDTH, ELEMENT ĐẦU TIÊN)
            Antigravity V1.2: KHÔNG có gì chen trước S2S.
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <S2SHeroSection financeData={financeData} />
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            HÀNG 2 — CHỈ SỐ KẾ TOÁN BỊ HẠ CẤP (3 metric cards)
            Intentionally subdued: không icon nổi, không badge %, nền xám.
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SubduedMetricCard
              title="Thu Nhập Tháng"
              amount={financeData?.total_income || 0}
              icon={<TrendingUp size={14} />}
              note="Thông tin từ hệ thống"
            />
            <SubduedMetricCard
              title="Chi Phí Cố Định"
              amount={financeData?.total_expense || 0}
              icon={<Wallet size={14} />}
              note="Dự tính theo tháng"
            />
            <SubduedMetricCard
              title="Cam Kết Tiết Kiệm"
              amount={financeData?.goals_allocation || 0}
              icon={<TrendingDown size={14} />}
              note="Dành cho mục tiêu"
            />
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            HÀNG 3 — VÍ TIỀN MẶT: CÔ LẬP THÀNH DẢI NGANG ĐỘC LẬP
            Không nằm cùng column với Bills. Dải mỏng, nằm ngang = thứ yếu.
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <CashWalletStrip
            balance={cashBalance}
            onSync={handleCashSync}
          />
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            HÀNG 4 — NỘI DUNG CHI TIẾT
            Left 8/12: Transactions (top) + Goals (bottom)
            Right 4/12: Bills only
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* ── LEFT: Transactions + Goals stacked ── */}
            <div className="lg:col-span-8 space-y-4">

              {/* Recent Transactions */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
                    <CreditCard size={16} className="text-indigo-500" />
                    Giao Dịch Gần Đây
                  </h3>
                  <Link
                    href="/transactions"
                    className="flex items-center gap-1 text-[12px] font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Tất cả <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentTx.map((tx: any) => (
                    <motion.div
                      key={tx.id}
                      whileHover={{ x: 2 }}
                      className="flex items-center justify-between group py-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100/60 flex items-center justify-center text-base group-hover:bg-white group-hover:shadow-sm transition-all">
                          {tx.categoryId === 1 ? "💰" : tx.categoryId === 2 ? "🍔" : "📦"}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                            {tx.note}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(tx.displayDate).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[13px] font-bold tabular-nums ${
                          tx.type === "income" ? "text-emerald-500" : "text-gray-700"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "−"}{formatVND(Number(tx.amount))}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Quick add nudge */}
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 text-gray-400 hover:text-blue-500 transition-all text-[12px] font-semibold"
                >
                  <MessageCircle size={14} />
                  Thêm giao dịch nhanh bằng Chat AI...
                </button>
              </div>

              {/* Goals */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
                    <Target size={16} className="text-orange-500" />
                    Mục Tiêu Tiết Kiệm
                  </h3>
                  <Link
                    href="/goals"
                    className="flex items-center gap-1 text-[12px] font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Tất cả <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(goals || []).slice(0, 4).map((goal) => {
                    const current = Number(goal.currentSaved);
                    const target = Number(goal.targetAmount);
                    const pct = Math.min(Math.round((current / target) * 100), 100);
                    const statusColor =
                      goal.status === "completed"
                        ? "from-emerald-500 to-green-500"
                        : goal.status === "paused"
                        ? "from-gray-300 to-gray-400"
                        : "from-blue-500 to-indigo-500";
                    return (
                      <div key={goal.id} className="group p-4 rounded-xl bg-gray-50/60 hover:bg-white border border-gray-100/60 hover:border-gray-200 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{goal.icon}</span>
                            <div>
                              <p className="text-[12px] font-bold text-gray-800 leading-tight">{goal.name}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {goal.status === "completed" ? "✅ Hoàn thành" : `Góp ${formatVND(Number(goal.monthlyContribution))}/tháng`}
                              </p>
                            </div>
                          </div>
                          <span className="text-[13px] font-black text-gray-800">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                            className={`h-full rounded-full bg-gradient-to-r ${statusColor}`}
                          />
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-[10px] text-gray-400">{formatVND(current)}</span>
                          <span className="text-[10px] font-semibold text-gray-500">{formatVND(target)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Bills only ── */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] sticky top-4">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
                    <Calendar size={16} className="text-blue-500" />
                    Hóa Đơn Sắp Tới
                  </h3>
                  <Link
                    href="/bills"
                    className="flex items-center gap-1 text-[12px] font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Tất cả <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {(bills || []).map((bill) => {
                    const isPaid = bill.status === "inactive"; // Simplified logic for now
                    return (
                      <motion.div
                        key={bill.id}
                        whileHover={{ x: 2 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isPaid
                            ? "border-gray-100 bg-gray-50/40 opacity-60"
                            : "border-gray-100 bg-gray-50/40 hover:bg-white hover:border-gray-200"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-sm flex-shrink-0">
                          {bill.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-gray-900 truncate">{bill.name}</p>
                          <p className="text-[10px] font-semibold text-gray-400">
                            {isPaid ? "✅ Đã thanh toán" : `Hạn: Ngày ${bill.dueDay}`}
                          </p>
                        </div>
                        <p className="text-[12px] font-black text-gray-800 flex-shrink-0">
                          {formatVND(Number(bill.amount))}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Bills total */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-gray-400">Tổng chi cố định</span>
                  <span className="text-[14px] font-black text-gray-800">
                    {formatVND(financeData?.total_expense || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
