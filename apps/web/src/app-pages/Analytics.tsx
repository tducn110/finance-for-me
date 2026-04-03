"use client";
import { motion } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from "lucide-react";
import { formatVND } from "../data/mockData";
import { useCategorySpending, useMonthlyTrend } from "../hooks/useAPI";
import {
  mockCategorySpending,
  mockMonthlyTrend,
} from "../data/mockData";

const USE_REAL_API = false;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-3 border border-gray-100">
        <p className="text-[13px] font-semibold text-gray-900 mb-0.5">
          {payload[0].name}
        </p>
        <p className="text-[14px] font-bold" style={{ color: payload[0].payload.color || "#3B82F6" }}>
          {formatVND(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-3 border border-gray-100 text-[13px] min-w-[120px]">
        <p className="font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex justify-between items-center gap-4 mb-1">
            <span className="text-gray-500">{p.name === "income" ? "Thu nhập" : "Chi tiêu"}</span>
            <span className="font-semibold" style={{ color: p.color }}>
              {formatVND(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { data: categorySpendingData } = useCategorySpending();
  const { data: monthlyTrendData } = useMonthlyTrend();
  
  const categorySpending = (USE_REAL_API ? categorySpendingData?.map(c => ({
    name: c.category_name,
    value: c.total_spent,
    color: c.color,
    icon: c.icon
  })) : mockCategorySpending) || mockCategorySpending;
  
  const monthlyTrend = (USE_REAL_API ? monthlyTrendData : mockMonthlyTrend) || mockMonthlyTrend;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 } as const
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } as const }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-[1400px] mx-auto space-y-6 pb-20"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">
          📊 Phân Tích Chi Tiết
        </h1>
        <p className="text-[14px] text-gray-600">
          Biểu đồ & insight về dòng tiền, cơ cấu chi tiêu của bạn
        </p>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cash Flow Chart */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 text-[18px] flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-500" /> Dòng Tiền 6 Tháng
              </h3>
              <p className="text-gray-500 text-[13px] mt-1">Phân tích xu hướng thu chi theo tháng</p>
            </div>
            <div className="flex items-center gap-4 text-[12px] font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Thu nhập
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div> Chi tiêu
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyTrend} barSize={16} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: "#64748B", fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`}
                  dx={-10}
                />
                <Tooltip cursor={{ fill: '#f8fafc' }} content={<BarTooltip />} />
                <Bar key="bar-income" dataKey="income" name="income" fill="#10B981" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                <Bar key="bar-expense" dataKey="expense" name="expense" fill="#F87171" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Spending Structure - Pie Chart */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon size={20} className="text-purple-500" />
            <div>
              <h3 className="font-semibold text-gray-900 text-[18px]">Cơ Cấu Chi Tiêu</h3>
              <p className="text-gray-500 text-[13px] mt-0.5">Phân bố chi tiêu theo danh mục</p>
            </div>
          </div>
          
          <div className="relative flex justify-center items-center h-[240px] min-h-[240px]">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[12px] font-medium text-gray-500">Tổng chi</span>
              <span className="text-[18px] font-bold text-gray-900">
                {formatVND(categorySpending.reduce((sum, cat) => sum + cat.value, 0))}
              </span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {categorySpending.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                  <span className="text-[13px] font-medium text-gray-900">{cat.name}</span>
                </div>
                <span className="text-[13px] font-bold text-gray-600">
                  {formatVND(cat.value)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Spending Trend Line Chart */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={20} className="text-orange-500" />
            <div>
              <h3 className="font-semibold text-gray-900 text-[18px]">Xu Hướng Chi Tiêu</h3>
              <p className="text-gray-500 text-[13px] mt-0.5">Biến động theo thời gian</p>
            </div>
          </div>
          
          <div className="h-[240px] w-full min-h-[240px]">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: "#64748B" }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Line 
                  key="line-expense"
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#F87171" 
                  strokeWidth={3}
                  dot={{ fill: "#F87171", r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Insights Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900 text-[14px]">Mức Chi Trung Bình</h4>
          </div>
          <p className="text-[24px] font-bold text-blue-900">
            {formatVND(monthlyTrend.reduce((sum, m) => sum + m.expense, 0) / monthlyTrend.length)}
          </p>
          <p className="text-[12px] text-blue-700 mt-1">/ tháng trong 6 tháng qua</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900 text-[14px]">Danh Mục Chi Nhiều Nhất</h4>
          </div>
          <p className="text-[20px] font-bold text-purple-900">
            {categorySpending.reduce((max, cat) => cat.value > max.value ? cat : max, categorySpending[0])?.name}
          </p>
          <p className="text-[12px] text-purple-700 mt-1">
            {formatVND(categorySpending.reduce((max, cat) => cat.value > max.value ? cat : max, categorySpending[0])?.value)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-orange-600" />
            <h4 className="font-semibold text-orange-900 text-[14px]">Tiết Kiệm Được</h4>
          </div>
          <p className="text-[24px] font-bold text-orange-900">
            {formatVND(
              monthlyTrend.reduce((sum, m) => sum + m.income, 0) - 
              monthlyTrend.reduce((sum, m) => sum + m.expense, 0)
            )}
          </p>
          <p className="text-[12px] text-orange-700 mt-1">Trong 6 tháng qua</p>
        </div>
      </motion.div>

    </motion.div>
  );
}
