import { useState } from "react";
import { Plus, X } from "lucide-react";
import { mockBills, formatVND } from "../data/mockData";

type BillStatus = "pending" | "paid" | "overdue";

interface Bill {
  id: number;
  name: string;
  icon: string;
  amount: number;
  due_day: number;
  status: BillStatus;
  category: string;
}

const statusConfig: Record<BillStatus, { label: string; color: string; bg: string; pulse?: boolean }> = {
  pending: { label: "Chưa trả", color: "#D97706", bg: "#FEF3C7" },
  paid: { label: "Đã trả", color: "#10B981", bg: "#D1FAE5" },
  overdue: { label: "Quá hạn", color: "#EF4444", bg: "#FEE2E2", pulse: true },
};

const iconOptions = ["🏠", "💡", "📶", "🛡️", "🎵", "🎬", "📱", "💧", "🚗", "📺"];

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [showModal, setShowModal] = useState(false);
  const [newBill, setNewBill] = useState({ name: "", icon: "📋", amount: "", due_day: "1", category: "Khác" });

  const unpaidTotal = bills.filter(b => b.status !== "paid").reduce((s, b) => s + b.amount, 0);
  const paidTotal = bills.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const overdueTotal = bills.filter(b => b.status === "overdue").reduce((s, b) => s + b.amount, 0);

  const handleMarkPaid = (id: number) => {
    setBills((prev) => prev.map((b) => b.id === id ? { ...b, status: "paid" } : b));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const b: Bill = {
      id: Date.now(),
      name: newBill.name,
      icon: newBill.icon,
      amount: parseInt(newBill.amount.replace(/\D/g, "")) || 0,
      due_day: parseInt(newBill.due_day) || 1,
      status: "pending",
      category: newBill.category,
    };
    setBills((prev) => [...prev, b]);
    setShowModal(false);
    setNewBill({ name: "", icon: "📋", amount: "", due_day: "1", category: "Khác" });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold" style={{ color: "#1E293B" }}>Hóa Đơn Hàng Tháng 📋</h1>
          <p className="text-[14px] mt-0.5" style={{ color: "#64748B" }}>Quản lý các chi phí cố định hàng tháng</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[14px] font-medium hover:shadow-md transition-all"
          style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
        >
          <Plus size={15} />
          Thêm Hóa Đơn Mới
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "#FEF3C7" }}>⏳</div>
            <p className="text-[13px] font-medium" style={{ color: "#64748B" }}>Tổng Chưa Trả</p>
          </div>
          <p className="text-[22px] font-bold" style={{ color: "#D97706" }}>{formatVND(unpaidTotal)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "#FEE2E2" }}>🚨</div>
            <p className="text-[13px] font-medium" style={{ color: "#64748B" }}>Quá Hạn</p>
          </div>
          <p className="text-[22px] font-bold" style={{ color: "#EF4444" }}>{formatVND(overdueTotal)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "#D1FAE5" }}>✅</div>
            <p className="text-[13px] font-medium" style={{ color: "#64748B" }}>Đã Thanh Toán</p>
          </div>
          <p className="text-[22px] font-bold" style={{ color: "#10B981" }}>{formatVND(paidTotal)}</p>
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {bills.map((bill) => {
          const s = statusConfig[bill.status];
          return (
            <div
              key={bill.id}
              className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all"
              style={{ borderColor: bill.status === "overdue" ? "#FCA5A5" : "#F1F5F9" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: s.bg }}
                >
                  {bill.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[15px]" style={{ color: "#1E293B" }}>{bill.name}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${s.pulse ? "animate-pulse" : ""}`}
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <p className="text-[12px]" style={{ color: "#94A3B8" }}>
                    📅 Hạn: Ngày {bill.due_day} hàng tháng · {bill.category}
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[18px] font-bold" style={{ color: "#1E293B" }}>{formatVND(bill.amount)}</p>
                  </div>

                  {bill.status !== "paid" && (
                    <button
                      onClick={() => handleMarkPaid(bill.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium hover:shadow-sm transition-all"
                      style={{ background: "#D1FAE5", color: "#10B981" }}
                    >
                      ✅ Đánh dấu đã trả
                    </button>
                  )}

                  {bill.status === "paid" && (
                    <div className="flex items-center gap-1 text-[13px] font-medium" style={{ color: "#10B981" }}>
                      ✅ Đã thanh toán
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[18px]" style={{ color: "#1E293B" }}>Thêm Hóa Đơn Mới 📋</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100" style={{ color: "#64748B" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#374151" }}>Icon</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewBill({ ...newBill, icon: ic })}
                      className="w-10 h-10 rounded-xl text-xl border-2 transition-all"
                      style={{ borderColor: newBill.icon === ic ? "#3B82F6" : "#E2E8F0", background: newBill.icon === ic ? "#EFF6FF" : "white" }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              {[
                { key: "name", label: "Tên hóa đơn", placeholder: "Tiền điện, Internet..." },
                { key: "amount", label: "Số tiền (₫)", placeholder: "350000" },
                { key: "due_day", label: "Ngày đến hạn (1-31)", placeholder: "5" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#374151" }}>{f.label}</label>
                  <input
                    type="text"
                    value={newBill[f.key as keyof typeof newBill]}
                    onChange={(e) => setNewBill({ ...newBill, [f.key]: e.target.value })}
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
                Thêm Hóa Đơn
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
