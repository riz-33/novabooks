"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

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
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
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

  useEffect(() => {
    if (user) {
      axios
        .get(
          `/api/reports/profit-loss?userId=${user.id}&start=${dateRange.start}&end=${dateRange.end}`,
        )
        .then((res) => {
          const data = res.data;
          setReportData({
            income: data.income || [],
            expenses: data.expenses || [],
            netProfit: data.netProfit || 0,
          });
        })
        .catch((err) => console.error("P&L Fetch Error:", err))
        .finally(() => setLoading(false));
    }
  }, [user, dateRange.start, dateRange.end]);

  const totalIncome = reportData.income.reduce((s, a) => s + a.amount, 0);
  const totalExpenses = reportData.expenses.reduce((s, a) => s + a.amount, 0);
  const calculatedNetProfit = totalIncome - totalExpenses;

  if (
    loading &&
    reportData.income.length === 0 &&
    reportData.expenses.length === 0
  ) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-black text-nova-navy tracking-widest text-sm animate-pulse">
        LOADING STATEMENT VOUCHERS...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* Header & Date Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-nova-navy tracking-tight dark:text-white">
            Profit & Loss
          </h1>
          <p className="text-nova-gold font-bold text-xs uppercase tracking-widest mt-1">
            Income Statement
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2 px-1">
            <Calendar size={16} className="text-gray-400 text-shrink-0" />
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
          <div className="flex items-center gap-2 px-1">
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

      <div
        className={`mb-12 p-5 rounded-[3rem] flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-500 ${
          calculatedNetProfit >= 0
            ? "bg-nova-navy text-white shadow-blue-900/20"
            : "bg-rose-950 text-white shadow-rose-950/20"
        }`}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">
          Net Profit / Loss
        </p>
        <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
          PKR {calculatedNetProfit.toLocaleString()}
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md">
          {calculatedNetProfit >= 0 ? (
            <TrendingUp size={18} className="text-emerald-400" />
          ) : (
            <TrendingDown size={18} className="text-rose-400" />
          )}
          <span className="text-xs font-black uppercase tracking-widest">
            {calculatedNetProfit >= 0 ? "Profitable Period" : "Net Loss Period"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Income Card */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-nova-navy mb-8 border-b border-gray-100 pb-4 flex justify-between items-center">
            INCOME{" "}
            <span className="text-emerald-600 font-black text-xl">+</span>
          </h3>
          <div className="space-y-6">
            {reportData.income.length === 0 ? (
              <p className="text-sm font-bold text-gray-400 italic">
                No revenue items logged.
              </p>
            ) : (
              reportData.income.map((item, i) => (
                <PLLine
                  key={i}
                  label={item.name}
                  amount={item.amount}
                  color="text-emerald-600"
                />
              ))
            )}
            <div className="pt-6 border-t-2 border-dashed border-gray-100 flex justify-between font-black text-nova-navy">
              <span className="text-xs uppercase tracking-widest align-middle flex items-center">
                Total Income
              </span>
              <span>PKR {totalIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-nova-navy mb-8 border-b border-gray-100 pb-4 flex justify-between items-center">
            EXPENSES <span className="text-rose-600 font-black text-xl">-</span>
          </h3>
          <div className="space-y-6">
            {reportData.expenses.length === 0 ? (
              <p className="text-sm font-bold text-gray-400 italic">
                No expense entries logged.
              </p>
            ) : (
              reportData.expenses.map((item, i) => (
                <PLLine
                  key={i}
                  label={item.name}
                  amount={item.amount}
                  color="text-rose-600"
                />
              ))
            )}
            <div className="pt-6 border-t-2 border-dashed border-gray-100 flex justify-between font-black text-nova-navy">
              <span className="text-xs uppercase tracking-widest align-middle flex items-center">
                Total Expenses
              </span>
              <span>PKR {totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <span className={`font-black ${color}`}>PKR {amount.toLocaleString()}</span>
  </div>
);
