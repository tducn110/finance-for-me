import { useState } from "react";
import { Plus, Calculator, X } from "lucide-react";
import { mockGoals, formatVND } from "../data/mockData";

type GoalStatus = "active" | "completed" | "paused";

interface Goal {
  id: number;
  name: string;
  icon: string;
  current_saved: number;
  target_amount: number;
  monthly_contribution: number;
  status: GoalStatus;
  deadline: string;
}

const statusConfig: Record<GoalStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Đang thực hiện", color: "#10B981", bg: "#D1FAE5" },
  completed: { label: "Hoàn thành", color: "#3B82F6", bg: "#DBEAFE" },
  paused: { label: "Tạm dừng", color: "#94A3B8", bg: "#F1F5F9" },
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [impactAmount, setImpactAmount] = useState("");
  const [impactResult, setImpactResult] = useState<string | null>(null);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", icon: "🎯", target_amount: "", monthly_contribution: "" });

  const handleImpactCheck = () => {
    const amount = parseInt(impactAmount.replace(/\D/g, ""));
    if (!amount || goals.length === 0) return;
    const activeGoal = goals.find((g) => g.status === "active");
    if (!activeGoal) return;
    const daysDelay = Math.round((amount / activeGoal.monthly_contribution) * 30);
    setImpactResult(
      `Nếu mua ${formatVND(amount)}, mục tiêu "${activeGoal.name}" sẽ chậm lại khoảng ${daysDelay} ngày 📉`
    );
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const g: Goal = {
      id: Date.now(),
      name: newGoal.name,
      icon: newGoal.icon,
      current_saved: 0,
      target_amount: parseInt(newGoal.target_amount.replace(/\D/g, "")) || 0,
      monthly_contribution: parseInt(newGoal.monthly_contribution.replace(/\D/g, "")) || 0,
      status: "active",
      deadline: "12/2027",
    };
    setGoals((prev) => [g, ...prev]);
    setShowNewGoalModal(false);
    setNewGoal({ name: "", icon: "🎯", target_amount: "", monthly_contribution: "" });
  };

  const toggleStatus = (id: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, status: g.status === "active" ? "paused" : g.status === "paused" ? "active" : g.status }
          : g
      )
    );
  };

  const iconOptions = ["🎯", "📱", "✈️", "🏠", "💻", "🚗", "🎓", "💍", "🏖️", "🛡️"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold" style={{ color: "#1E293B" }}>Mục Tiêu Tiết Kiệm 🎯</h1>
          <p className="text-[14px] mt-0.5" style={{ color: "#64748B" }}>Theo dõi và quản lý mục tiêu tài chính</p>
        </div>
        <button
          onClick={() => setShowNewGoalModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[14px] font-medium transition-all hover:shadow-md"
          style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
        >
          <Plus size={15} />
          Tạo Mục Tiêu Mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Đang thực hiện", value: goals.filter(g => g.status === "active").length, color: "#10B981", bg: "#D1FAE5" },
          { label: "Hoàn thành", value: goals.filter(g => g.status === "completed").length, color: "#3B82F6", bg: "#DBEAFE" },
          { label: "Tổng đã tiết kiệm", value: formatVND(goals.reduce((s, g) => s + g.current_saved, 0)), color: "#6366F1", bg: "#EEF2FF" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-[12px] font-medium mb-1" style={{ color: "#64748B" }}>{stat.label}</p>
            <p className="text-[20px] font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const percent = Math.min(Math.round((goal.current_saved / goal.target_amount) * 100), 100);
          const s = statusConfig[goal.status];
          const remaining = goal.target_amount - goal.current_saved;
          const monthsLeft = goal.monthly_contribution > 0
            ? Math.ceil(remaining / goal.monthly_contribution)
            : null;

          return (
            <div key={goal.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: s.bg }}
                  >
                    {goal.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[15px]" style={{ color: "#1E293B" }}>{goal.name}</h3>
                    <p className="text-[12px]" style={{ color: "#94A3B8" }}>Deadline: {goal.deadline}</p>
                  </div>
                </div>
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.label}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-[12px] mb-1.5" style={{ color: "#64748B" }}>
                  <span>Đã tiết kiệm: <strong style={{ color: "#10B981" }}>{formatVND(goal.current_saved)}</strong></span>
                  <span className="font-semibold" style={{ color: "#3B82F6" }}>{percent}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${percent}%`,
                      background: goal.status === "completed"
                        ? "linear-gradient(90deg, #3B82F6, #6366F1)"
                        : "linear-gradient(90deg, #10B981, #059669)",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <p className="text-[11px]" style={{ color: "#94A3B8" }}>
                    Mục tiêu: {formatVND(goal.target_amount)}
                  </p>
                  {monthsLeft !== null && goal.status === "active" && (
                    <p className="text-[11px]" style={{ color: "#94A3B8" }}>
                      ~{monthsLeft} tháng nữa
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#F1F5F9" }}>
                <p className="text-[12px]" style={{ color: "#64748B" }}>
                  Mỗi tháng góp: <strong style={{ color: "#1E293B" }}>{formatVND(goal.monthly_contribution)}</strong>
                </p>
                {goal.status !== "completed" && (
                  <button
                    onClick={() => toggleStatus(goal.id)}
                    className="text-[12px] font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: goal.status === "active" ? "#F59E0B" : "#10B981" }}
                  >
                    {goal.status === "active" ? "⏸ Tạm dừng" : "▶ Tiếp tục"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact Calculator */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={18} style={{ color: "#6366F1" }} />
          <h3 className="font-semibold text-[16px]" style={{ color: "#1E293B" }}>
            Máy Tính Tác Động Chi Tiêu
          </h3>
        </div>
        <p className="text-[13px] mb-4" style={{ color: "#64748B" }}>
          Kiểm tra xem nếu bạn chi tiêu thêm một khoản, mục tiêu của bạn sẽ bị ảnh hưởng thế nào?
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={impactAmount}
            onChange={(e) => setImpactAmount(e.target.value)}
            placeholder="Ví dụ: 500000"
            className="flex-1 px-4 py-3 rounded-xl border outline-none text-[14px]"
            style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#1E293B" }}
            onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
            onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
          />
          <button
            onClick={handleImpactCheck}
            className="px-5 py-3 rounded-xl text-white font-medium text-[14px] hover:shadow-md transition-all"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            Kiểm tra
          </button>
        </div>
        {impactResult && (
          <div className="mt-3 p-4 rounded-xl text-[13px] font-medium" style={{ background: "#EEF2FF", color: "#6366F1" }}>
            💡 {impactResult}
          </div>
        )}
      </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewGoalModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[18px]" style={{ color: "#1E293B" }}>Tạo Mục Tiêu Mới 🎯</h2>
              <button onClick={() => setShowNewGoalModal(false)} className="p-2 rounded-lg hover:bg-gray-100" style={{ color: "#64748B" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#374151" }}>Icon</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewGoal({ ...newGoal, icon: ic })}
                      className="w-10 h-10 rounded-xl text-xl border-2 transition-all"
                      style={{ borderColor: newGoal.icon === ic ? "#3B82F6" : "#E2E8F0", background: newGoal.icon === ic ? "#EFF6FF" : "white" }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              {[
                { key: "name", label: "Tên mục tiêu", placeholder: "Mua iPhone 16 Pro" },
                { key: "target_amount", label: "Số tiền mục tiêu (₫)", placeholder: "25000000" },
                { key: "monthly_contribution", label: "Đóng góp hàng tháng (₫)", placeholder: "2000000" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#374151" }}>{f.label}</label>
                  <input
                    type="text"
                    value={newGoal[f.key as keyof typeof newGoal]}
                    onChange={(e) => setNewGoal({ ...newGoal, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none text-[14px]"
                    style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#1E293B" }}
                    onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white font-semibold text-[15px] hover:shadow-md transition-all"
                style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
              >
                Tạo Mục Tiêu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
