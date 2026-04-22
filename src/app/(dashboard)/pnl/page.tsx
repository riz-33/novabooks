"use client";

import React, { useState, useEffect } from "react";
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";

// 1. Define Interfaces for your data
interface FinanceItem {
  name: string;
  amount: number;
}

interface ReportData {
  income: FinanceItem[];
  expenses: FinanceItem[];
  netProfit: number;
}

interface DateRange {
  start: string;
  end: string;
}

export default function ProfitLoss() {
  // 2. Add types to your state
  const [reportData, setReportData] = useState<ReportData>({
    income: [],
    expenses: [],
    netProfit: 0,
  });

  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState<boolean>(true);

  //   useEffect(() => {
  //     const fetchPL = async () => {
  //       // In Next.js, we check for window to ensure we are on the client
  //       if (typeof window === "undefined") return;

  //       setLoading(true);
  //       try {
  //         const token = localStorage.getItem("token");
  //         const res = await axios.get(
  //           `/api/reports/profit-loss?start=${dateRange.start}&end=${dateRange.end}`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //             },
  //           },
  //         );
  //         setReportData(res.data);
  //       } catch (err) {
  //         console.error("P&L Fetch Error:", err);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchPL();
  //   }, [dateRange]);

  // 3. Calculated values with optional chaining safely typed
  const totalIncome = reportData.income.reduce((s, a) => s + a.amount, 0);
  const totalExpenses = reportData.expenses.reduce((s, a) => s + a.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  if (loading && reportData.income.length === 0) {
    return (
      <div className="p-8 text-center font-bold text-nova-navy">
        Loading Statement...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header & Date Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-nova-navy tracking-tight">
            Profit & Loss
          </h1>
          <p className="text-nova-gold font-bold text-xs uppercase tracking-widest mt-1">
            Income Statement
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-3">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="text-xs font-bold text-nova-navy outline-none bg-transparent cursor-pointer"
            />
          </div>
          <Minus size={12} className="text-gray-300" />
          <div className="flex items-center gap-2 px-3">
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="text-xs font-bold text-nova-navy outline-none bg-transparent cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Summary Banner */}
      <div
        className={`mb-12 p-10 rounded-[3rem] flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-500 ${
          netProfit >= 0
            ? "bg-nova-navy text-white shadow-blue-900/20"
            : "bg-rose-900 text-white shadow-rose-900/20"
        }`}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">
          Net Profit / Loss
        </p>
        <h2 className="text-6xl font-black mb-4">
          ${netProfit.toLocaleString()}
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md">
          {netProfit >= 0 ? (
            <TrendingUp size={18} className="text-emerald-400" />
          ) : (
            <TrendingDown size={18} className="text-rose-400" />
          )}
          <span className="text-xs font-black uppercase tracking-widest">
            {netProfit >= 0 ? "Profitable Period" : "Net Loss Period"}
          </span>
        </div>
      </div>

      {/* Income & Expense Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-50 shadow-sm">
          <h3 className="text-lg font-black text-nova-navy mb-8 border-b border-gray-100 pb-4 flex justify-between">
            INCOME <span className="text-emerald-600">+</span>
          </h3>
          <div className="space-y-6">
            {reportData.income.map((item, i) => (
              <PLLine
                key={i}
                label={item.name}
                amount={item.amount}
                color="text-emerald-600"
              />
            ))}
            <div className="pt-6 border-t-2 border-dashed border-gray-100 flex justify-between font-black text-nova-navy">
              <span className="text-xs uppercase tracking-widest">
                Total Income
              </span>
              <span>${totalIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-50 shadow-sm">
          <h3 className="text-lg font-black text-nova-navy mb-8 border-b border-gray-100 pb-4 flex justify-between">
            EXPENSES <span className="text-rose-600">-</span>
          </h3>
          <div className="space-y-6">
            {reportData.expenses.map((item, i) => (
              <PLLine
                key={i}
                label={item.name}
                amount={item.amount}
                color="text-rose-600"
              />
            ))}
            <div className="pt-6 border-t-2 border-dashed border-gray-100 flex justify-between font-black text-nova-navy">
              <span className="text-xs uppercase tracking-widest">
                Total Expenses
              </span>
              <span>${totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Properly typed sub-component
interface PLLineProps {
  label: string;
  amount: number;
  color: string;
}

const PLLine = ({ label, amount, color }: PLLineProps) => (
  <div className="flex justify-between items-center group">
    <span className="text-gray-500 font-bold text-sm group-hover:text-nova-navy transition-colors">
      {label}
    </span>
    <span className={`font-black ${color}`}>${amount.toLocaleString()}</span>
  </div>
);
