"use client";

import React, { useState, useEffect } from "react";
import { Calendar, FileText, DollarSign } from "lucide-react";

export default function BalanceSheet() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FileText size={20} />
        Balance Sheet
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        A snapshot of your business's financial position at a specific point in
        time.
      </p>
      <div className="flex items-center gap-4 mb-6">
        <Calendar size={16} className="text-gray-400" />
        <input
          type="date"
          className="text-sm font-bold text-nova-navy outline-none bg-transparent cursor-pointer"
        />
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <DollarSign size={16} />
          Total Assets
        </h2>
        <p className="text-2xl font-black text-nova-navy">$0.00</p>
      </div>
    </div>
  );
}
