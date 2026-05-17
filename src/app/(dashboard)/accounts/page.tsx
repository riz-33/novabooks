"use client";

import { useState } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* 🔹 ACCOUNT TYPES */
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

/* 🔹 MOCK DATA */
const initialAccounts = [
  {
    id: 1,
    name: "Main Business Account",
    balance: 12500,
    bank: "HBL",
    type: "Asset",
  },
  {
    id: 2,
    name: "Savings",
    balance: 5400,
    bank: "Meezan",
    type: "Asset",
  },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [openModal, setOpenModal] = useState(false);

  const handleAddAccount = (newAccount) => {
    setAccounts((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newAccount,
      },
    ]);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* 🔹 HEADER */}
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

      {/* 🔹 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <motion.div
            key={acc.id}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all"
          >
            {/* TOP */}
            <div className="flex items-start justify-between mb-5">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-slate-700 text-nova-navy dark:text-white">
                <Wallet size={24} />
              </div>

              <button className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* INFO */}
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">
                {acc.bank}
              </p>

              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {acc.name}
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {acc.type}
              </p>

              <div className="mt-5">
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  ${acc.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🔹 MODAL */}
      <CreateAccountModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onAccountCreated={handleAddAccount}
      />
    </div>
  );
}

/* 🔹 CREATE ACCOUNT MODAL */
function CreateAccountModal({ isOpen, onClose, onAccountCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "Asset",
    balance: "",
    bank: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // 👉 Replace with API later

      const payload = {
        ...formData,
        balance: Number(formData.balance),
      };

      await new Promise((resolve) => setTimeout(resolve, 800));

      onAccountCreated(payload);

      setFormData({
        name: "",
        type: "Asset",
        balance: "",
        bank: "",
      });

      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* HEADER */}
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

              {/* FORM */}
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                {/* ACCOUNT NAME */}
                {/* <div className="space-y-2"> */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Account Name
                  </label>

                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Bank Name
                  </label>

                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Opening Balance
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    required
                    placeholder="Main Business Account"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-nova-navy dark:text-white outline-none"
                  />
                  {/* </div> */}

                  {/* BANK */}
                  {/* <div className="space-y-2"> */}

                  <input
                    required
                    placeholder="HBL / Meezan / UBL"
                    value={formData.bank}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bank: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-nova-navy dark:text-white outline-none"
                  />
                  {/* </div> */}

                  {/* BALANCE */}
                  {/* <div className="space-y-2"> */}

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
                    className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-nova-navy dark:text-white outline-none"
                  />
                </div>

                {/* ACCOUNT TYPES */}
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Account Type
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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

                {/* ACTIONS */}
                <div className="flex flex-col-reverse md:flex-row gap-4 pt-2">
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
