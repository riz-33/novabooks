"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Search,
  Plus,
  Trash2,
} from "lucide-react";

interface AccountOption {
  _id: string;
  name: string;
  type: string;
}

export default function LedgerPage() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Quick transaction state tracking double-entry legs
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState([
    { accountId: "", type: "Debit" as const, amount: "" },
    { accountId: "", type: "Credit" as const, amount: "" },
  ]);

  const getUserId = () => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    return user?._id || user?.id;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const token = localStorage.getItem("token");
      if (!userId) return;

      const [txRes, accRes] = await Promise.all([
        fetch(`/api/transactions?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/accounts?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const txData = await txRes.json();
      const accData = await accRes.json();

      setTransactions(txData.transactions || []);
      setAccounts(accData.accounts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePostTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = getUserId();
    const token = localStorage.getItem("token");

    const validatedLines = lines.map((l) => ({
      accountId: l.accountId,
      type: l.type,
      amount: Number(l.amount),
    }));

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description,
          date,
          journalLines: validatedLines,
          userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDescription("");
      setLines([
        { accountId: "", type: "Debit", amount: "" },
        { accountId: "", type: "Credit", amount: "" },
      ]);
      setShowAddForm(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to post transaction");
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-nova-navy">General Ledger</h1>
          <p className="text-nova-gold font-medium mt-1">
            Double-entry record of your company's accounts.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-nova-navy text-white px-6 py-3 rounded-2xl font-bold shadow-md hover:bg-blue-900 transition-all"
        >
          <Plus size={18} /> {showAddForm ? "Hide Form" : "New Transaction"}
        </button>
      </div>

      {/* DYNAMIC QUICK ENTRY DOUBLE-ENTRY FORM */}
      {showAddForm && (
        <form
          onSubmit={handlePostTransaction}
          className="bg-white border border-gray-100 shadow-sm p-6 rounded-[2rem] mb-8 space-y-4"
        >
          <h3 className="text-xl font-black text-nova-navy mb-2">
            Record Double-Entry Journal Entry
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="Transaction Memo/Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:border-nova-navy outline-none w-full"
            />
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:border-nova-navy outline-none w-full"
            />
          </div>

          <div className="space-y-3">
            {lines.map((line, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-50 p-4 rounded-xl"
              >
                <select
                  required
                  value={line.accountId}
                  onChange={(e) => {
                    const newLines = [...lines];
                    newLines[idx].accountId = e.target.value;
                    setLines(newLines);
                  }}
                  className="px-3 py-2 rounded-lg bg-white border border-gray-200 outline-none"
                >
                  <option value="">-- Select Account --</option>
                  {accounts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
                </select>

                <select
                  value={line.type}
                  onChange={(e) => {
                    const newLines = [...lines];
                    newLines[idx].type = e.target.value as "Debit" | "Credit";
                    setLines(newLines);
                  }}
                  className="px-3 py-2 rounded-lg bg-white border border-gray-200 outline-none font-bold"
                >
                  <option value="Debit">Debit</option>
                  <option value="Credit">Credit</option>
                </select>

                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={line.amount}
                  onChange={(e) => {
                    const newLines = [...lines];
                    newLines[idx].amount = e.target.value;
                    setLines(newLines);
                  }}
                  className="px-3 py-2 rounded-lg bg-white border border-gray-200 outline-none text-right font-bold"
                />

                {lines.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setLines(lines.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg w-fit justify-self-end"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() =>
                setLines([
                  ...lines,
                  { accountId: "", type: "Debit", amount: "" },
                ])
              }
              className="text-sm text-nova-navy font-bold hover:underline"
            >
              + Add Sub-ledger Split Leg
            </button>
            <button
              type="submit"
              className="bg-nova-navy text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-900 transition-all"
            >
              Post to Book
            </button>
          </div>
        </form>
      )}

      {/* LEDGER TRANSACTION MANAGEMENT MATRIX */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Date
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Memo Description
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Accounts Impacted
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                Debit / Credit Match
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t: any) => (
              <tr
                key={t._id}
                className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors"
              >
                <td className="p-4 text-sm font-medium text-gray-500">
                  {new Date(t.date).toLocaleDateString("en-GB")}
                </td>
                <td className="p-4 text-sm font-bold text-nova-navy">
                  {t.description}
                </td>
                <td className="p-4 space-y-1">
                  {t.journalLines?.map((line: any, i: number) => (
                    <div key={i} className="text-xs font-medium text-slate-600">
                      <span
                        className={`font-black mr-1 ${line.type === "Debit" ? "text-blue-600" : "text-amber-600"}`}
                      >
                        [{line.type[0]}]
                      </span>
                      {line.accountId?.name || "Deleted Account"}
                    </div>
                  ))}
                </td>
                <td className="p-4 text-sm font-black text-right">
                  {t.journalLines?.map((line: any, i: number) => (
                    <div
                      key={i}
                      className={`text-xs font-black ${line.type === "Debit" ? "text-emerald-600" : "text-slate-500"}`}
                    >
                      PKR {line.amount.toLocaleString()}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
