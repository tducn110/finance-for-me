import { useState } from "react";
import { Search, Trash2, Upload, Plus, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { mockTransactions, mockCategories, formatVND } from "../data/mockData";
import { QuickAddModal } from "../components/QuickAddModal";

const months = [
  "Tháng 3/2026", "Tháng 2/2026", "Tháng 1/2026",
  "Tháng 12/2025", "Tháng 11/2025", "Tháng 10/2025",
];

const ITEMS_PER_PAGE = 7;

export default function Transactions() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [selectedMonth, setSelectedMonth] = useState("Tháng 3/2026");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const filtered = transactions.filter((tx) => {
    const matchCategory = selectedCategory === "Tất cả" || tx.category === selectedCategory;
    const matchSearch = tx.note.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = (id: number) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const totalIncome = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold" style={{ color: "#1E293B" }}>Quản Lý Giao Dịch</h1>
          <p className="text-[14px] mt-0.5" style={{ color: "#64748B" }}>Theo dõi toàn bộ thu chi của bạn</p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[14px] font-medium hover:bg-gray-50 transition-colors"
            style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          >
            <Upload size={15} />
            <span className="hidden sm:inline">Upload Hóa Đơn</span>
          </button>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[14px] font-medium transition-all hover:shadow-md"
            style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Thêm Giao Dịch</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-[12px] font-medium mb-1" style={{ color: "#64748B" }}>Tổng Giao Dịch</p>
          <p className="text-[20px] font-bold" style={{ color: "#1E293B" }}>{filtered.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-[12px] font-medium mb-1" style={{ color: "#64748B" }}>Tổng Thu</p>
          <p className="text-[20px] font-bold" style={{ color: "#10B981" }}>+{formatVND(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-[12px] font-medium mb-1" style={{ color: "#64748B" }}>Tổng Chi</p>
          <p className="text-[20px] font-bold" style={{ color: "#EF4444" }}>-{formatVND(totalExpense)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 rounded-xl border text-[14px] outline-none"
            style={{ borderColor: "#E2E8F0", color: "#1E293B", background: "#F8FAFC" }}
          >
            {months.map((m) => <option key={m}>{m}</option>)}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 rounded-xl border text-[14px] outline-none"
            style={{ borderColor: "#E2E8F0", color: "#1E293B", background: "#F8FAFC" }}
          >
            <option>Tất cả</option>
            {mockCategories.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>

          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
            <Search size={15} style={{ color: "#94A3B8" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Tìm kiếm giao dịch..."
              className="flex-1 bg-transparent outline-none text-[14px]"
              style={{ color: "#1E293B" }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                <th className="text-left px-5 py-3 text-[12px] font-semibold" style={{ color: "#64748B" }}>Ngày</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold" style={{ color: "#64748B" }}>Ghi chú</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold" style={{ color: "#64748B" }}>Danh mục</th>
                <th className="text-right px-5 py-3 text-[12px] font-semibold" style={{ color: "#64748B" }}>Số tiền</th>
                <th className="text-center px-5 py-3 text-[12px] font-semibold" style={{ color: "#64748B" }}>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[14px]" style={{ color: "#94A3B8" }}>
                    Không tìm thấy giao dịch nào 😔
                  </td>
                </tr>
              ) : (
                paginated.map((tx, index) => (
                  <tr
                    key={tx.id}
                    className="border-b hover:bg-blue-50/30 transition-colors"
                    style={{ borderColor: "#F1F5F9", background: index % 2 === 0 ? "#FFFFFF" : "#FAFBFC" }}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-[13px]" style={{ color: "#64748B" }}>{tx.date}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-medium" style={{ color: "#1E293B" }}>{tx.note}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{tx.icon}</span>
                        <span className="text-[13px]" style={{ color: "#64748B" }}>{tx.category}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {tx.type === "income" ? (
                          <ArrowUpRight size={13} style={{ color: "#10B981" }} />
                        ) : (
                          <ArrowDownRight size={13} style={{ color: "#EF4444" }} />
                        )}
                        <span
                          className="text-[13px] font-semibold"
                          style={{ color: tx.type === "income" ? "#10B981" : "#EF4444" }}
                        >
                          {tx.type === "income" ? "+" : "-"}{formatVND(tx.amount)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        style={{ color: "#EF4444" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "#F1F5F9" }}>
            <p className="text-[13px]" style={{ color: "#64748B" }}>
              Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
                style={{ color: "#64748B" }}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="w-8 h-8 rounded-lg text-[13px] font-medium transition-colors"
                  style={{
                    background: currentPage === p ? "#3B82F6" : "transparent",
                    color: currentPage === p ? "white" : "#64748B",
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
                style={{ color: "#64748B" }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  );
}
