/**
 * S2S Hero Section — Antigravity V1.2
 * Khoảng Chi Tiêu An Toàn là element ĐẦUTIÊN, FULL-WIDTH trên Dashboard.
 * Height ≈ 2.5× card phụ. Không có gì chen trước nó.
 *
 * Formula: S2S = Income − Fixed Expenses − Savings Commitment − Emergency Buffer
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, ChevronDown, Info, TrendingDown } from "lucide-react";
import {
  formatVND,
  mockS2SData,
  mockS2SByPeriod,
  type S2SPeriod,
  type S2SStatus,
} from "../data/mockData";

// ─── SVG Ring Chart ────────────────────────────────────────────────────────
function S2SRing({
  percent,
  size = 156,
  status,
}: {
  percent: number;
  size?: number;
  status: S2SStatus;
}) {
  const strokeWidth = 13;
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;

  const ringColor =
    status === "danger" ? "#f87171" : status === "warning" ? "#fbbf24" : "#34d399";
  const glowColor =
    status === "danger"
      ? "rgba(248,113,113,0.35)"
      : status === "warning"
      ? "rgba(251,191,36,0.35)"
      : "rgba(52,211,153,0.35)";

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        className="drop-shadow-lg"
      >
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="text-[30px] font-black text-white leading-none"
        >
          {percent}%
        </motion.span>
        <span className="text-[10px] font-semibold mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          đã dùng
        </span>
        <span
          className="text-[11px] font-bold mt-0.5"
          style={{ color: ringColor }}
        >
          {/* shown below ring */}
        </span>
      </div>
    </div>
  );
}

// ─── Formula Pill ──────────────────────────────────────────────────────────
function Pill({
  label,
  sub,
  accent,
}: {
  label: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center px-3 py-2 rounded-xl"
      style={{
        backgroundColor: accent ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${accent ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.08)"}`,
        minWidth: 72,
      }}
    >
      <span
        className="text-[11px] font-bold"
        style={{ color: accent ? "#34d399" : "rgba(255,255,255,0.85)" }}
      >
        {label}
      </span>
      <span className="text-[9px] font-semibold mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
        {sub}
      </span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
interface S2SHeroSectionProps {
  data?: typeof mockS2SData;
}

export function S2SHeroSection({ data = mockS2SData }: S2SHeroSectionProps) {
  const [period, setPeriod] = useState<S2SPeriod>("month");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const periodData = mockS2SByPeriod[period];
  const { spent, remaining, percent, status } = periodData;

  const ringColor =
    status === "danger" ? "#f87171" : status === "warning" ? "#fbbf24" : "#34d399";

  const statusConfig = {
    safe:    { emoji: "✅", text: "An toàn — Ngân sách trong tầm kiểm soát", cls: "text-emerald-300", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.20)" },
    warning: { emoji: "⚠️", text: "Cần chú ý — Đã dùng hơn nửa ngân sách",  cls: "text-amber-300",   bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.20)"  },
    danger:  { emoji: "🚨", text: "Cảnh báo — Gần vượt ngân sách S2S!",       cls: "text-red-300",     bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.20)" },
  }[status];

  const periodLabel = period === "today" ? "Hôm nay" : period === "week" ? "Tuần này" : "Tháng này";

  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(135deg, #0a0f1e 0%, #111827 45%, #0d1526 100%)",
        minHeight: 240,
      }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: ringColor }}
        />
        <div
          className="absolute -bottom-24 -right-16 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: "#6366f1" }}
        />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 p-7 lg:p-9">
        {/* ── Top bar ── */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <p
                className="text-[11px] font-bold tracking-[0.14em] uppercase"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Khoảng Chi Tiêu An Toàn (S2S)
              </p>
              <p className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>
                {data.period} · Ngày nhận lương: {data.incomeDate} hàng tháng
              </p>
            </div>
          </div>

          {/* Period switcher */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            {(["today", "week", "month"] as S2SPeriod[]).map((p) => (
              <motion.button
                key={p}
                onClick={() => setPeriod(p)}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                style={{
                  background: period === p ? "rgba(255,255,255,0.14)" : "transparent",
                  color: period === p ? "#fff" : "rgba(255,255,255,0.38)",
                  border: period === p ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
                }}
              >
                {p === "today" ? "Hôm nay" : p === "week" ? "Tuần" : "Tháng"}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Main body ── */}
        <div className="flex items-center gap-8 lg:gap-12">
          {/* Left: Numbers */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
              Còn lại để chi tiêu tự do ({periodLabel})
            </p>

            <motion.h2
              key={`${period}-remaining`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="text-[42px] lg:text-[48px] font-black text-white tracking-tight leading-none mb-4"
              style={{ textShadow: `0 0 50px ${ringColor}50` }}
            >
              {formatVND(remaining)}
            </motion.h2>

            {/* Status badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-5"
              style={{
                background: statusConfig.bg,
                border: `1px solid ${statusConfig.border}`,
              }}
            >
              <span className={`text-[12px] font-bold ${statusConfig.cls}`}>
                {statusConfig.emoji} {statusConfig.text}
              </span>
            </div>

            {/* Formula strip */}
            <div className="flex items-center gap-2 flex-wrap">
              <Pill label={formatVND(data.monthlyIncome)} sub="Thu nhập" />
              <span className="text-[14px] font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>−</span>
              <Pill label={formatVND(data.fixedExpenses.total)} sub="Chi cố định" />
              <span className="text-[14px] font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>−</span>
              <Pill label={formatVND(data.savingsCommitment.total)} sub="Tiết kiệm" />
              <span className="text-[14px] font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>−</span>
              <Pill label={formatVND(data.emergencyBuffer)} sub="Buffer" />
              <span className="text-[14px] font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>=</span>
              <Pill label={formatVND(data.s2sBudget)} sub="Budget S2S" accent />

              {/* Breakdown toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                <Info size={12} />
                <span className="text-[10px] font-bold">Chi tiết</span>
                <motion.div animate={{ rotate: showBreakdown ? 180 : 0 }}>
                  <ChevronDown size={10} />
                </motion.div>
              </motion.button>
            </div>

            {/* Expanded breakdown */}
            <AnimatePresence>
              {showBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {/* Fixed expenses */}
                      <div>
                        <p className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                          Chi Phí Cố Định
                        </p>
                        {data.fixedExpenses.breakdown.map((item) => (
                          <div key={item.name} className="flex items-center justify-between py-1">
                            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                              {item.icon} {item.name}
                            </span>
                            <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                              {formatVND(item.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Savings */}
                      <div>
                        <p className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                          Cam Kết Tiết Kiệm
                        </p>
                        {data.savingsCommitment.breakdown.map((item) => (
                          <div key={item.name} className="flex items-center justify-between py-1">
                            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                              {item.icon} {item.name}
                              {item.completed && (
                                <span className="ml-1 text-[9px] text-emerald-400">✓</span>
                              )}
                            </span>
                            <span className="text-[11px] font-bold" style={{ color: item.completed ? "rgba(52,211,153,0.7)" : "rgba(255,255,255,0.7)" }}>
                              {item.completed ? "Hoàn thành" : formatVND(item.amount)}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between py-1 mt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                            🛡️ Emergency Buffer
                          </span>
                          <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                            {formatVND(data.emergencyBuffer)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Ring + Stats */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <S2SRing percent={percent} status={status} />

            {/* Below ring: spent vs budget */}
            <div className="flex items-center gap-4 text-center">
              <div>
                <p className="text-[11px] font-black" style={{ color: ringColor }}>
                  {formatVND(spent)}
                </p>
                <p className="text-[9px] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
                  đã chi
                </p>
              </div>
              <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div>
                <p className="text-[11px] font-black text-white">
                  {formatVND(period === "month" ? data.s2sBudget : mockS2SByPeriod[period].budget)}
                </p>
                <p className="text-[9px] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
                  budget
                </p>
              </div>
            </div>

            {/* Burn rate indicator */}
            {period === "month" && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <TrendingDown size={10} style={{ color: ringColor }} />
                <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Ngày hôm nay: {formatVND(data.dailyActualBurn)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
