"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
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
import {
  FileText,
  Plus,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Activity,
  Loader2,
} from "lucide-react";

const COLORS = ["#1e3a8a", "#9ca3af", "#d4af37"];

interface DashboardData {
  metrics: {
    totalRevenue: number;
    outstandingReceivables: number;
    healthScore: number;
    healthGrowth: string;
  };
  barData: Array<{ name: string; revenue: number; expense: number }>;
  pieData: Array<{ name: string; value: number }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    title: string;
    meta: string;
    amount: string;
    isPositive: boolean;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  // const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      axios
        .get(`/api/dashboard?userId=${user.id}`)
        .then((res) => setData(res.data))
        .catch((err) => console.log(err));
    }
  }, [user, loading]);

  // 1. Full-screen Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 text-gray-400">
        <Loader2
          className="animate-spin text-nova-navy dark:text-nova-gold"
          size={40}
        />
        <p className="text-xs font-black uppercase tracking-widest">
          Compiling Live Ledger metrics...
        </p>
      </div>
    );
  }

  // 2. Network Error State
  if (error || !data) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto my-12 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
        <h3 className="font-bold text-red-800 dark:text-red-400">
          Database Connection Error
        </h3>
        <p className="text-xs text-red-600 dark:text-red-300/80 mt-1">
          {error || "Could not collect stream items."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // 3. Operational State Data Render
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen transition-colors duration-200 dark:bg-slate-900">
      {/* HEADER TITLES */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-nova-navy dark:text-white tracking-tight">
          Welcome Back
        </h1>
        <p className="text-nova-gold font-medium text-sm mt-1">
          Reviewing your modern ledger metrics for automated compliance.
        </p>
      </div>

      {/* METRIC CARD STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-gray-400 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Total
            Revenue
          </p>
          <h2 className="text-3xl font-black text-nova-navy dark:text-white tracking-tight">
            Rs. {data.metrics.totalRevenue.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-gray-400 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-nova-gold" />{" "}
            Outstanding Receivables
          </p>
          <h2 className="text-3xl font-black text-nova-navy dark:text-white tracking-tight">
            Rs. {data.metrics.outstandingReceivables.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
          <p className="text-gray-400 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Fiscal
            Health Score
          </p>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {data.metrics.healthScore}%
            </h2>
            <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
              ↗ {data.metrics.healthGrowth}
            </span>
          </div>
        </div>
      </div>

      {/* PRIMARY DATA GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHARTS CONTAINER (SPANS 2 COLUMNS ON DESKTOP) */}
        <div className="lg:col-span-2 space-y-8">
          {/* BAR CHART CARD */}
          <div className="bg-white dark:bg-slate-950 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-nova-navy dark:text-white tracking-tight text-lg">
                Monthly Cash Flow
              </h3>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-blue-900 dark:text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-900 dark:bg-blue-400" />{" "}
                  Revenue
                </span>
                <span className="flex items-center gap-1.5 text-nova-gold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-nova-gold" />{" "}
                  Expenses
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={data.barData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                  className="dark:stroke-slate-800"
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
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#1e3a8a"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="expense"
                  fill="#d4af37"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* DONUT PIE CHART CARD */}
          <div className="bg-white dark:bg-slate-950 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-nova-navy dark:text-white tracking-tight text-lg mb-4">
              Expense Resource Allocations
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
              <div className="w-full max-w-[240px]">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.pieData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={6}
                      dataKey="value"
                    >
                      {data.pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 w-full sm:w-auto">
                {data.pieData.map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-800 min-w-[200px]"
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx] }}
                    />
                    <div className="flex justify-between w-full text-xs font-bold">
                      <span className="text-gray-400">{item.name}</span>
                      <span className="text-nova-navy dark:text-white">
                        Rs. {item.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR ACTIONS PANEL */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-950 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-nova-navy dark:text-white tracking-tight text-lg mb-6">
              Quick Controls
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition-all group focus:outline-none">
                <span className="text-sm font-bold text-gray-600 dark:text-slate-300 group-hover:text-nova-navy dark:group-hover:text-white transition-colors">
                  Record Journal Entry
                </span>
                <Plus size={18} className="text-nova-gold" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition-all group focus:outline-none">
                <span className="text-sm font-bold text-gray-600 dark:text-slate-300 group-hover:text-nova-navy dark:group-hover:text-white transition-colors">
                  Generate Balance Sheet
                </span>
                <FileText
                  size={18}
                  className="text-nova-navy dark:text-slate-400"
                />
              </button>
            </div>
          </div>

          {/* DYNAMIC AUDIT LOG LIST FROM BACKEND MAP */}
          <div className="bg-white dark:bg-slate-950 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-nova-navy dark:text-white tracking-tight text-lg mb-6">
              Recent Transactions
            </h3>

            <div className="space-y-4">
              {data.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-gray-50 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-900/10"
                >
                  <div className="flex items-center gap-3 pr-2 min-w-0">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-inner flex-shrink-0">
                      {tx.type === "invoice" && (
                        <ArrowUpRight size={16} className="text-emerald-600" />
                      )}
                      {tx.type === "expense" && (
                        <TrendingUp size={16} className="text-blue-600" />
                      )}
                      {tx.type === "tax" && (
                        <CreditCard size={16} className="text-nova-gold" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-nova-navy dark:text-white truncate">
                        {tx.title}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5 truncate">
                        {tx.meta}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-black tracking-tight flex-shrink-0 ${
                      tx.isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-nova-navy dark:text-slate-300"
                    }`}
                  >
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
