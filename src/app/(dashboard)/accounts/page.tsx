"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  Plus,
  MoreVertical,
  X,
  Landmark,
  ShieldCheck,
  PieChart,
  TrendingUp,
  TrendingDown,
  FileText,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

const ACCOUNT_TYPES = [
  {
    label: "Asset",
    value: "Asset",
    icon: Landmark,
    description: "Cash, Bank, Inventory, Property",
  },
  {
    label: "Liability",
    value: "Liability",
    icon: ShieldCheck,
    description: "Loans, Credit Cards, Accounts Payable",
  },
  {
    label: "Equity",
    value: "Equity",
    icon: PieChart,
    description: "Owner's Capital, Retained Earnings",
  },
  {
    label: "Income",
    value: "Income",
    icon: TrendingUp,
    description: "Sales, Service Revenue, Interest",
  },
  {
    label: "Expense",
    value: "Expense",
    icon: TrendingDown,
    description: "Rent, Salaries, Utilities",
  },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      const currentUserId = user?._id || user?.id;

      if (!currentUserId) {
        console.warn("No user context found in localStorage.");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/accounts?userId=${currentUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error("Failed fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            My Accounts
          </h1>

          <p className="text-nova-gold font-medium mt-1">
            Manage your linked banks and wallets.
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center justify-center gap-2 bg-nova-navy text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Add Account
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 border border-slate-200 dark:border-slate-700 text-center">
          <Landmark
            size={60}
            className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
          />

          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            No Accounts Found
          </h3>

          <p className="text-slate-500 mt-2">
            Create your first account to start tracking finances.
          </p>

          <button
            onClick={() => setOpenModal(true)}
            className="mt-6 bg-nova-navy text-white px-6 py-3 rounded-2xl font-bold"
          >
            Add Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {accounts.map((acc) => (
            <motion.div
              key={acc._id}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-2xl bg-blue-50 dark:bg-slate-700 text-nova-navy dark:text-white">
                  {acc.type === "Asset" ? (
                    <Landmark size={24} />
                  ) : acc.type === "Liability" ? (
                    <ShieldCheck size={24} />
                  ) : acc.type === "Equity" ? (
                    <PieChart size={24} />
                  ) : acc.type === "Income" ? (
                    <TrendingUp size={24} />
                  ) : acc.type === "Expense" ? (
                    <TrendingDown size={24} />
                  ) : (
                    <FileText size={24} />
                  )}
                </div>

                {/* <button className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition"> */}
                {/* <MoreVertical size={20} /> */}
                {/* </button> */}

                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
                    {acc.type}
                  </p>

                  <h3 className="text-l font-black text-slate-900 dark:text-white">
                    {acc.name}
                  </h3>

                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    PKR {Number(acc.balance).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateAccountModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        refreshAccounts={fetchAccounts}
      />
    </div>
  );
}

function CreateAccountModal({ isOpen, onClose, refreshAccounts }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "Asset",
    balance: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      const user = storedUser ? JSON.parse(storedUser) : null;
      const currentUserId = user?._id || user?.id;

      if (!currentUserId) {
        alert("Session expired or invalid user profile. Please log in again.");
        return;
      }

      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: currentUserId, // Uses the safe fallback ID
          name: formData.name,
          type: formData.type,
          balance: Number(formData.balance) || 0,
        }),
      });

      if (res.ok) {
        refreshAccounts();
        onClose();
        setFormData({ name: "", type: "Asset", balance: "" });
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to create account");
      }
    } catch (error) {
      console.error("Modal submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Create New Account
                  </h2>

                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Add a new financial account to your ledger.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="text-slate-500" size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 ">
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Account Name
                  </label>

                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Opening Balance
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    placeholder="Main Bank Account"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-2 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-nova-navy dark:text-white outline-none"
                  />

                  <input
                    required
                    type="number"
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        balance: e.target.value,
                      })
                    }
                    className="w-full px-2 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-nova-navy dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-4 mt-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Account Type
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ACCOUNT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            type: type.value,
                          })
                        }
                        className={`flex items-start gap-4 p-2 rounded-2xl border-2 transition-all text-left
                        ${
                          formData.type === type.value
                            ? "border-nova-navy bg-blue-50 dark:bg-slate-800"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl
                          ${
                            formData.type === type.value
                              ? "bg-nova-navy text-white"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                          }`}
                        >
                          <type.icon size={20} />
                        </div>

                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {type.label}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {type.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2 rounded-2xl font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-2 rounded-2xl bg-nova-navy text-white font-black shadow-xl hover:scale-[1.01] active:scale-[0.98] transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "ADD ACCOUNT"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
