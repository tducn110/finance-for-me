"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@finance/shared-schemas";
import { toast } from "sonner";
import { apiClient } from "../services/api";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: InsertUser) => {
    setIsSubmitting(true);
    try {
      await apiClient.register(data);

      toast.success("Tạo tài khoản thành công! Hãy đăng nhập.");
      router.push("/login");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng ký";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[18px]" style={{ color: "#1E293B" }}>S2S Finance</h1>
            <p className="text-[12px]" style={{ color: "#64748B" }}>Safe-to-Spend Tracker</p>
          </div>
        </div>

        <h2 className="text-[24px] font-bold mb-1" style={{ color: "#1E293B" }}>Tạo tài khoản mới 🚀</h2>
        <p className="mb-6 text-[14px]" style={{ color: "#64748B" }}>Bắt đầu hành trình quản lý tài chính thông minh</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[14px] font-medium mb-1.5" style={{ color: "#374151" }}>
              Họ và tên
            </label>
            <input
              {...register("fullName")}
              type="text"
              placeholder="Nguyễn Văn A"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors text-[15px] ${
                errors.fullName ? "border-red-500" : "border-[#E2E8F0]"
              }`}
              style={{ background: "#F8FAFC", color: "#1E293B" }}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="text-red-500 text-[12px] mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[14px] font-medium mb-1.5" style={{ color: "#374151" }}>
              Tên đăng nhập
            </label>
            <input
              {...register("username")}
              type="text"
              placeholder="nguyenvana (chữ thường, số, _)"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors text-[15px] ${
                errors.username ? "border-red-500" : "border-[#E2E8F0]"
              }`}
              style={{ background: "#F8FAFC", color: "#1E293B" }}
              disabled={isSubmitting}
            />
            {errors.username && (
              <p className="text-red-500 text-[12px] mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[14px] font-medium mb-1.5" style={{ color: "#374151" }}>
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="email@example.com"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors text-[15px] ${
                errors.email ? "border-red-500" : "border-[#E2E8F0]"
              }`}
              style={{ background: "#F8FAFC", color: "#1E293B" }}
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
                placeholder="Tối thiểu 8 ký tự..."
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors text-[15px] pr-12 ${
                  errors.password ? "border-red-500" : "border-[#E2E8F0]"
                }`}
                style={{ background: "#F8FAFC", color: "#1E293B" }}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-white font-semibold text-[15px] transition-all hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              "Đăng Ký"
            )}
          </button>
        </form>

        <p className="text-center mt-5 text-[14px]" style={{ color: "#64748B" }}>
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "#3B82F6" }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
