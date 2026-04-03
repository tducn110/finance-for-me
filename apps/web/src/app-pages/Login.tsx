"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@finance/shared-schemas";
import { toast } from "sonner";
import { apiClient } from "../services/api";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "demo@s2sfinance.com",
      password: "demo1234",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      const result = await apiClient.login(data);

      toast.success("Chào mừng trở lại, " + result.user.fullName + "!");
      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng nhập";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}>
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[20px]" style={{ color: "#1E293B" }}>S2S Finance</h1>
              <p className="text-[12px]" style={{ color: "#64748B" }}>Safe-to-Spend Tracker</p>
            </div>
          </div>

          <h2 className="text-[28px] font-bold mb-2" style={{ color: "#1E293B" }}>Chào mừng trở lại! 👋</h2>
          <p className="mb-8 text-[15px]" style={{ color: "#64748B" }}>Đăng nhập để quản lý tài chính của bạn</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[14px] font-medium mb-1.5" style={{ color: "#374151" }}>
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="Nhập email của bạn..."
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors text-[15px] ${
                  errors.email ? "border-red-500" : "border-[#E2E8F0]"
                }`}
                style={{ background: "#FFFFFF", color: "#1E293B" }}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-[12px] mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[14px] font-medium mb-1.5" style={{ color: "#374151" }}>
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu..."
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors text-[15px] pr-12 ${
                    errors.password ? "border-red-500" : "border-[#E2E8F0]"
                  }`}
                  style={{ background: "#FFFFFF", color: "#1E293B" }}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "#64748B" }}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-[12px] mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-[14px]" style={{ color: "#64748B" }}>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-[14px] font-medium" style={{ color: "#3B82F6" }}>Quên mật khẩu?</a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-white font-semibold text-[15px] transition-all hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng Nhập"
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-[14px]" style={{ color: "#64748B" }}>
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-semibold" style={{ color: "#3B82F6" }}>
              Đăng ký ngay
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-4 p-3 rounded-xl text-center" style={{ background: "#EFF6FF" }}>
            <p className="text-[13px]" style={{ color: "#3B82F6" }}>
              💡 Hệ thống đã được nối với <strong>Real API</strong>.<br />
              Tài khoản Demo: <strong>demo@s2sfinance.com</strong> / <strong>demo1234</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Right - Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12" style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}>
        <div className="text-white text-center max-w-md">
          <div className="text-8xl mb-6">💰</div>
          <h2 className="text-[32px] font-bold mb-4">Kiểm soát tài chính</h2>
          <p className="text-[16px] opacity-90 leading-relaxed">
            S2S Finance giúp bạn theo dõi thu chi, quản lý mục tiêu tiết kiệm và kiểm soát hóa đơn hàng tháng một cách thông minh.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: "📊", label: "Phân tích chi tiết" },
              { icon: "🎯", label: "Mục tiêu rõ ràng" },
              { icon: "🔔", label: "Nhắc nhở kịp thời" },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-[12px] font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
