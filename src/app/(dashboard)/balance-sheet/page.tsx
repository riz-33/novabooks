"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, ShieldCheck, Scale, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

interface AccountLine {
  name: string;
  amount: number;
}

interface BalanceSheetData {
  assets: AccountLine[];
  liabilities: AccountLine[];
  equity: AccountLine[];
}

export default function BalanceSheet() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<BalanceSheetData>({
    assets: [],
    liabilities: [],
    equity: [],
  });
  const [asOfDate, setAsOfDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    if (user) {
      axios
        .get(`/api/reports/balance-sheet?userId=${user.id}&date=${asOfDate}`)
        .then((res) => {
          const result = res.data;
          setData({
            assets: result.assets || [],
            liabilities: result.liabilities || [],
            equity: result.equity || [],
          });
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user, asOfDate]);

  const totalAssets = data.assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = data.liabilities.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const totalEquity = data.equity.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  // The Equation Match Check
  const isBalanced =
    totalAssets.toFixed(2) === totalLiabilitiesAndEquity.toFixed(2);

  if (loading && data.assets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-black text-nova-navy tracking-widest text-sm animate-pulse">
        CALCULATING CAPITAL BALANCES...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-nova-navy tracking-tight dark:text-white">
            Balance Sheet
          </h1>
          <p className="text-nova-gold font-bold text-xs uppercase tracking-widest mt-1">
            Statement of Financial Position
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-400 uppercase mr-1">
            As Of:
          </span>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="text-xs font-black text-nova-navy outline-none bg-transparent cursor-pointer"
          />
        </div>
      </div>

      <div
        className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 transition-colors ${
          isBalanced
            ? "bg-emerald-50 border-emerald-100 text-emerald-800"
            : "bg-amber-50 border-amber-100 text-amber-800"
        }`}
      >
        {isBalanced ? (
          <ShieldCheck size={22} className="text-emerald-600" />
        ) : (
          <AlertCircle size={22} className="text-amber-600" />
        )}
        <div>
          <p className="text-sm font-black uppercase tracking-wider">
            {isBalanced
              ? "Books Perfectly Balanced"
              : "Balance Mismatch Detected"}
          </p>
          <p className="text-xs opacity-80 font-medium">
            Assets ({totalAssets.toLocaleString()} PKR){" "}
            {isBalanced ? "matches" : "does not equal"} Liabilities + Equity (
            {totalLiabilitiesAndEquity.toLocaleString()} PKR).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm h-full">
          <h3 className="text-lg font-black text-nova-navy mb-6 border-b pb-3 flex justify-between">
            ASSETS <Scale size={18} className="text-slate-400" />
          </h3>
          <div className="space-y-4 min-h-[120px]">
            {data.assets.length === 0 ? (
              <p className="text-xs font-bold text-gray-400 italic">
                No asset ledger records found.
              </p>
            ) : (
              data.assets.map((item, idx) => (
                <ReportRow key={idx} name={item.name} amount={item.amount} />
              ))
            )}
          </div>
          <div className="mt-8 pt-4 border-t-2 border-slate-900 flex justify-between font-black text-nova-navy text-base">
            <span>TOTAL ASSETS</span>
            <span>PKR {totalAssets.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-nova-navy mb-6 border-b pb-3">
              LIABILITIES
            </h3>
            <div className="space-y-4">
              {data.liabilities.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 italic">
                  No active liabilities recorded.
                </p>
              ) : (
                data.liabilities.map((item, idx) => (
                  <ReportRow key={idx} name={item.name} amount={item.amount} />
                ))
              )}
            </div>
            <div className="mt-6 pt-3 border-t border-dashed flex justify-between font-bold text-slate-700 text-sm">
              <span>Total Liabilities</span>
              <span>PKR {totalLiabilities.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-nova-navy mb-6 border-b pb-3">
              EQUITY
            </h3>
            <div className="space-y-4">
              {data.equity.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 italic">
                  No shareholder equity tracked.
                </p>
              ) : (
                data.equity.map((item, idx) => (
                  <ReportRow key={idx} name={item.name} amount={item.amount} />
                ))
              )}
            </div>
            <div className="mt-6 pt-3 border-t border-dashed flex justify-between font-bold text-slate-700 text-sm">
              <span>Total Equity</span>
              <span>PKR {totalEquity.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-nova-navy text-white p-6 rounded-2xl flex justify-between items-center shadow-lg">
            <span className="text-xs font-black uppercase tracking-widest opacity-80">
              Total Liabilities & Equity
            </span>
            <span className="text-xl font-black">
              PKR {totalLiabilitiesAndEquity.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const ReportRow = ({ name, amount }: { name: string; amount: number }) => (
  <div className="flex justify-between items-center text-sm font-medium border-b border-slate-50 pb-2">
    <span className="text-gray-500 font-bold">{name}</span>
    <span className="font-black text-nova-navy">
      PKR {amount.toLocaleString()}
    </span>
  </div>
);
