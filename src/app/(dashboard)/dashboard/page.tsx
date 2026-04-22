"use client"; // Required for Recharts and interactive buttons
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FileText, Plus } from "lucide-react";

const COLORS = ["#1e3a8a", "#9ca3af", "#d4af37"];

const barData = [
  { name: "Jan", revenue: 400, expense: 240 },
  { name: "Feb", revenue: 300, expense: 139 },
  { name: "Mar", revenue: 500, expense: 380 },
  { name: "Apr", revenue: 600, expense: 390 },
  { name: "May", revenue: 450, expense: 480 },
  { name: "Jun", revenue: 700, expense: 380 },
];

const pieData = [
  { name: "Data", value: 400 },
  { name: "Expense", value: 300 },
  { name: "Other", value: 300 },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevents hydration errors with charts

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-nova-navy tracking-tight">
          Welcome Back
        </h1>
        <p className="text-nova-gold font-medium">
          Reviewing your modern ledger for small businesses.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
            Total Revenue
          </p>
          <h2 className="text-3xl font-black text-nova-navy">$1,519,635</h2>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
            Unpaid Invoices
          </p>
          <h2 className="text-3xl font-black text-nova-navy">21,258</h2>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
            Health Score
          </p>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black text-emerald-600">423</h2>
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-lg">
              ↗ +12%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Side: Charts (Span 2) */}
        <div className="lg:col-span-1 space-y-8">
          {/* Bar Chart */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="font-bold text-nova-navy mb-6">Monthly Cash Flow</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <Tooltip
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#1e3a8a"
                  radius={[6, 6, 0, 0]}
                  barSize={30}
                />
                <Bar
                  dataKey="expense"
                  fill="#d4af37"
                  radius={[6, 6, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* <div className="grid grid-cols-2 lg:grid-cols-1 gap-8"> */}
        {/* Left Side: Charts (Span 2) */}
        <div className="lg:col-span-1 space-y-8">
          {/* Bar Chart */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="font-bold text-nova-navy mb-6">Expense Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-900"></span>{" "}
                  Data
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>{" "}
                  Expense
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-yellow-600"></span>{" "}
                  Other
                </div>
              </div>
            </ResponsiveContainer>
            {/* </div> */}
          </div>
        </div>
      </div>

      {/* Right Side: Activity & Actions */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-full">
          <h3 className="font-bold text-nova-navy mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all group">
              <span className="text-sm font-bold text-gray-600">
                New Expense
              </span>
              <Plus size={18} className="text-nova-gold" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all group">
              <span className="text-sm font-bold text-gray-600">
                Generate Report
              </span>
              <FileText size={18} className="text-nova-navy" />
            </button>
          </div>

          <h3 className="font-bold text-nova-navy mt-10 mb-6">
            Recent Activity
          </h3>
          <div className="space-y-6">
            {/* Map your activity items here as you did before */}
          </div>

          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
