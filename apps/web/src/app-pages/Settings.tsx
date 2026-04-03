"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Wallet, LogOut, Save, Check, Tag } from "lucide-react";
import { mockUser, mockCategories } from "../data/mockData";
import { useAuth } from "../hooks/useAPI";
import { useEffect } from "react";
import CategoryManager from "../components/CategoryManager";

export default function Settings() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({ 
    fullName: user?.fullName || mockUser.fullName,
    username: user?.username || mockUser.username,
    email: user?.email || mockUser.email 
  });
  const [finance, setFinance] = useState({ emergency_buffer: "2000000", income_date: "5", monthly_budget: "10000000" });
  const [security, setSecurity] = useState({ current: "", newPass: "", confirm: "" });
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName,
        username: user.username,
        email: user.email
      });
    }
  }, [user]);
  
  // Category management state
  const [categories, setCategories] = useState(mockCategories);

  const handleSave = (section: string) => {
    setSaved((prev) => ({ ...prev, [section]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [section]: false })), 2000);
  };

  const formatNumberInput = (val: string) => val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Category handlers
  const handleAddCategory = (newCategory: any) => {
    const id = Math.max(...categories.map(c => c.id), 0) + 1;
    setCategories([...categories, { ...newCategory, id }]);
    console.log("Added category:", newCategory);
    // TODO: Call API to save to backend
  };

  const handleEditCategory = (id: number, updates: any) => {
    setCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c));
    console.log("Edited category:", id, updates);
    // TODO: Call API to update backend
  };

  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
    console.log("Deleted category:", id);
    // TODO: Call API to soft delete
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-[24px] font-bold" style={{ color: "#1E293B" }}>Cài Đặt ⚙️</h1>
        <p className="text-[14px] mt-0.5" style={{ color: "#64748B" }}>Quản lý thông tin cá nhân và cấu hình tài chính</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "#F1F5F9", background: "#F8FAFC" }}>
          <User size={16} style={{ color: "#3B82F6" }} />
          <h2 className="font-semibold text-[15px]" style={{ color: "#1E293B" }}>Thông Tin Cá Nhân</h2>
        </div>
        <div className="p-5 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold" style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}>
              {mockUser.avatar}
            </div>
            <div>
              <p className="font-semibold text-[15px]" style={{ color: "#1E293B" }}>{profile.fullName}</p>
              <p className="text-[13px]" style={{ color: "#64748B" }}>@{profile.username}</p>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#374151" }}>Tên đăng nhập (không thể sửa)</label>
            <input
              type="text"
              value={profile.username}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border text-[14px] cursor-not-allowed"
              style={{ borderColor: "#E2E8F0", background: "#F1F5F9", color: "#94A3B8" }}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#374151" }}>Họ và tên</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border outline-none text-[14px]"
              style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#1E293B" }}
              onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#374151" }}>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border outline-none text-[14px]"
              style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#1E293B" }}
              onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
            />
          </div>
          <button
            onClick={() => handleSave("profile")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[14px] font-medium hover:shadow-md transition-all"
            style={{ background: saved.profile ? "#10B981" : "linear-gradient(135deg, #3B82F6, #6366F1)" }}
          >
            {saved.profile ? <Check size={15} /> : <Save size={15} />}
            {saved.profile ? "Đã lưu!" : "Lưu thông tin"}
          </button>
        </div>
      </div>

      {/* Finance Config */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "#F1F5F9", background: "#F8FAFC" }}>
          <Wallet size={16} style={{ color: "#10B981" }} />
          <h2 className="font-semibold text-[15px]" style={{ color: "#1E293B" }}>Cấu Hình Tài Chính</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#374151" }}>Quỹ Khẩn Cấp (₫)</label>
            <input
              type="text"
              value={formatNumberInput(finance.emergency_buffer)}
              onChange={(e) => setFinance({ ...finance, emergency_buffer: e.target.value.replace(/,/g, "") })}
              className="w-full px-4 py-2.5 rounded-xl border outline-none text-[14px]"
              style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#1E293B" }}
              onFocus={(e) => (e.target.style.borderColor = "#10B981")}
              onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
            />
            <p className="text-[11px] mt-1" style={{ color: "#94A3B8" }}>Số tiền dự phòng cho trường hợp khẩn cấp</p>
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#374151" }}>Ngày Nhận Lương</label>
            <select
              value={finance.income_date}
              onChange={(e) => setFinance({ ...finance, income_date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border outline-none text-[14px]"
              style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#1E293B" }}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={String(d)}>Ngày {d} hàng tháng</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#374151" }}>Ngân Sách Tháng (₫)</label>
            <input
              type="text"
              value={formatNumberInput(finance.monthly_budget)}
              onChange={(e) => setFinance({ ...finance, monthly_budget: e.target.value.replace(/,/g, "") })}
              className="w-full px-4 py-2.5 rounded-xl border outline-none text-[14px]"
              style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#1E293B" }}
              onFocus={(e) => (e.target.style.borderColor = "#10B981")}
              onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
            />
          </div>
          <button
            onClick={() => handleSave("finance")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[14px] font-medium hover:shadow-md transition-all"
            style={{ background: saved.finance ? "#10B981" : "linear-gradient(135deg, #10B981, #059669)" }}
          >
            {saved.finance ? <Check size={15} /> : <Save size={15} />}
            {saved.finance ? "Đã lưu!" : "Cập nhật cấu hình"}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "#F1F5F9", background: "#F8FAFC" }}>
          <Lock size={16} style={{ color: "#F59E0B" }} />
          <h2 className="font-semibold text-[15px]" style={{ color: "#1E293B" }}>Bảo Mật</h2>
        </div>
        <div className="p-5 space-y-4">
          {[
            { key: "current", label: "Mật khẩu hiện tại", placeholder: "••••••••" },
            { key: "newPass", label: "Mật khẩu mới", placeholder: "••••••••" },
            { key: "confirm", label: "Xác nhận mật khẩu mới", placeholder: "••••••••" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#374151" }}>{f.label}</label>
              <input
                type="password"
                value={security[f.key as keyof typeof security]}
                onChange={(e) => setSecurity({ ...security, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full px-4 py-2.5 rounded-xl border outline-none text-[14px]"
                style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#1E293B" }}
                onFocus={(e) => (e.target.style.borderColor = "#F59E0B")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>
          ))}
          <button
            onClick={() => handleSave("security")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[14px] font-medium hover:shadow-md transition-all"
            style={{ background: saved.security ? "#10B981" : "linear-gradient(135deg, #F59E0B, #D97706)" }}
          >
            {saved.security ? <Check size={15} /> : <Lock size={15} />}
            {saved.security ? "Đã cập nhật!" : "Cập Nhật Mật Khẩu"}
          </button>
        </div>
      </div>

      {/* Category Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "#F1F5F9", background: "#F8FAFC" }}>
          <Tag size={16} style={{ color: "#6574CD" }} />
          <h2 className="font-semibold text-[15px]" style={{ color: "#1E293B" }}>Danh Mục Giao Dịch</h2>
        </div>
        <div className="p-5">
          <CategoryManager
            categories={categories}
            onAdd={handleAddCategory}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
          />
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5">
        <h3 className="font-semibold text-[15px] mb-2" style={{ color: "#1E293B" }}>Đăng Xuất</h3>
        <p className="text-[13px] mb-4" style={{ color: "#64748B" }}>
          Đăng xuất khỏi tài khoản S2S Finance của bạn
        </p>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[14px] font-medium hover:shadow-md transition-all"
          style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
        >
          <LogOut size={15} />
          Đăng Xuất
        </button>
      </div>
    </div>
  );
}
