"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import {
  Bell,
  Globe,
  Lock,
  Moon,
  CreditCard,
  Sun,
  User,
  Building,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [currencyPreference, setCurrencyPreference] = useState<boolean>(true);
  const [ledgerAlerts, setLedgerAlerts] = useState<boolean>(true);
  const [invoiceReminders, setInvoiceReminders] = useState<boolean>(true);

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    companyName: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchedUser = localStorage.getItem("user");
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    if (fetchedUser) {
      const user = JSON.parse(fetchedUser);
      setProfile({
        fullName: user.name?.toUpperCase() || "Muhammad Rizwan",
        email: user.email || "rizwan@example.com",
        companyName: user.companyName || "Nova Solutions",
      });
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: profile.fullName,
          email: profile.email,
          companyName: profile.companyName,
        }),
      );

      // Redirect back to profile to inspect fresh records layout output
      router.push("/profile");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px]  mx-auto min-h-screen transition-colors duration-200 dark:bg-slate-900">
      {/* HEADER NAVIGATION ACTION PANEL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-black uppercase text-gray-400 dark:text-slate-500 hover:text-nova-navy dark:hover:text-white tracking-widest mb-2 transition-colors focus:outline-none"
          >
            <ArrowLeft size={14} /> Return
          </button>
          <h1 className="text-3xl font-black text-nova-navy dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-nova-gold font-medium mt-1">
            Configure NovaBooks to fit your business workflows.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-nova-navy hover:bg-opacity-90 dark:bg-nova-gold dark:text-nova-navy text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md disabled:opacity-50 w-full sm:w-auto justify-center"
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* PROFILE BLOCK */}
        <SettingSection title="User Profile">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-nova-navy dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
                className="w-full px-4 py-3 text-sm font-bold bg-slate-50 dark:bg-slate-800 text-nova-navy dark:text-white border border-transparent focus:border-gray-100 dark:focus:border-slate-700 outline-none rounded-xl transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-nova-navy dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full px-4 py-3 text-sm font-bold bg-slate-50 dark:bg-slate-800 text-nova-navy dark:text-white border border-transparent focus:border-gray-100 dark:focus:border-slate-700 outline-none rounded-xl transition-all"
                required
              />
            </div>
          </div>
        </SettingSection>

        {/* METADATA ENTERPRISE BLOCK */}
        <SettingSection title="Business Settings">
          <div className="p-4 space-y-1.5">
            <label className="text-xs font-black text-nova-navy dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Building size={14} /> Organization / Company Name
            </label>
            <input
              type="text"
              value={profile.companyName}
              onChange={(e) =>
                setProfile({ ...profile, companyName: e.target.value })
              }
              placeholder="e.g., Nova Software Solutions"
              className="w-full px-4 py-3 text-sm font-bold bg-slate-50 dark:bg-slate-800 text-nova-navy dark:text-white border border-transparent focus:border-gray-100 dark:focus:border-slate-700 outline-none rounded-xl transition-all"
              required
            />
            <p className="text-[11px] text-gray-400 dark:text-slate-400 pt-0.5">
              This name generates automatically at the header of ledger audit
              downloads and Balance Sheets.
            </p>
          </div>
        </SettingSection>

        {/* THEME PREFERENCES CONTROL BLOCK */}
        <SettingSection title="Preferences">
          <ToggleItem
            icon={darkMode ? <Sun size={20} /> : <Moon size={20} />}
            label="Dark Mode"
            description="Switch to a high-contrast dark user interface option."
            enabled={darkMode}
            onChange={toggleDarkMode}
          />
          <ToggleItem
            icon={<Globe size={20} />}
            label="Base Reporting Currency"
            description="Default regional books tracking currency format (PKR)."
            enabled={currencyPreference}
            onChange={() => setCurrencyPreference(!currencyPreference)}
          />
        </SettingSection>

        {/* NOTIFICATION CHANNELS BLOCK */}
        <SettingSection title="Notifications">
          <ToggleItem
            icon={<Bell size={20} />}
            label="High-Value Ledger Alerts"
            description="Flag and review substantial transaction volumes instantly."
            enabled={ledgerAlerts}
            onChange={() => setLedgerAlerts(!ledgerAlerts)}
          />
          <ToggleItem
            icon={<CreditCard size={20} />}
            label="Automated Invoice Reminders"
            description="Send electronic payment alerts to entities with aging balances."
            enabled={invoiceReminders}
            onChange={() => setInvoiceReminders(!invoiceReminders)}
          />
        </SettingSection>

        {/* SYSTEM RISK ACCESS CONTROLS BLOCK */}
        <SettingSection title="Security">
          <button
            type="button"
            onClick={() =>
              alert("Redirecting to password modification process...")
            }
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors rounded-2xl group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-nova-navy dark:text-white group-hover:bg-nova-navy group-hover:text-white dark:group-hover:bg-nova-gold dark:group-hover:text-nova-navy transition-colors">
                <Lock size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-nova-navy dark:text-white">
                  Change Password
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
                  Secure access profile management.
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-nova-gold tracking-widest group-hover:underline">
              UPDATE
            </span>
          </button>
        </SettingSection>
      </form>
    </div>
  );
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50/60 dark:bg-slate-900/40 border-b border-gray-100 dark:border-slate-800">
        <h2 className="text-xs font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
          {title}
        </h2>
      </div>
      <div className="p-3 divide-y divide-gray-50 dark:divide-slate-900/50">
        {children}
      </div>
    </div>
  );
}

interface ToggleItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}

function ToggleItem({
  icon,
  label,
  description,
  enabled,
  onChange,
}: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between p-4 transition-colors">
      <div className="flex items-center gap-4 pr-4">
        <div className="text-gray-400 dark:text-slate-400 flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-nova-navy dark:text-white">
            {label}
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onChange}
        className={`w-11 h-6 rounded-full relative transition-colors focus:outline-none flex-shrink-0 focus:ring-2 focus:ring-nova-navy/10 ${
          enabled
            ? "bg-nova-navy dark:bg-nova-gold"
            : "bg-gray-200 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full shadow-sm transition-all ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
