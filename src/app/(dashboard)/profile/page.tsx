"use client";

import React, { useEffect, useState } from "react";
import { User, Mail, Shield, Calendar, Settings } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  name: string;
  email: string;
  companyName: string;
  role: string;
  joined: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>({
    name: "Muhammad Rizwan",
    email: "rizwan@example.com",
    companyName: "Nova Solutions",
    role: "Administrator",
    joined: "January 2026",
  });

  useEffect(() => {
    // Sync live profile state with persistent local configuration cache
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
          companyName: parsed.companyName || prev.companyName,
        }));
      }
    }
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-[1400px]  mx-auto min-h-screen transition-colors duration-200 dark:bg-slate-900">
      {/* HEADER ACTIONS */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-nova-navy dark:text-white tracking-tight">
            Account Profile
          </h1>
          <p className="text-nova-gold font-medium text-sm mt-1">
            Manage your personal verification credentials.
          </p>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-nova-navy dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm w-full sm:w-auto justify-center"
        >
          <Settings size={14} /> Update Credentials
        </Link>
      </div>

      {/* CARD BODY CONTEXT CONTAINER */}
      <div className=" bg-white dark:bg-slate-950 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Banner Graphic Asset Decor */}
        <div className="h-32 bg-gradient-to-r from-nova-navy to-slate-800 dark:from-slate-950 dark:to-nova-navy border-b dark:border-slate-800" />

        <div className="px-6 md:px-10 pb-10">
          {/* Avatar Shift Alignment */}
          <div className="relative flex justify-between items-end -mt-12 mb-8">
            <div className="p-1 bg-white dark:bg-slate-950 rounded-[2rem]">
              <div className="h-24 w-24 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] flex items-center justify-center text-nova-navy dark:text-nova-gold border-4 border-white dark:border-slate-950 shadow-inner">
                <User size={44} />
              </div>
            </div>
            <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-900/30">
              Active Session
            </span>
          </div>

          {/* FIELDS DETAIL COMPONENT DISTRIBUTION MATRIX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField
              icon={<User size={18} />}
              label="Full Name"
              value={user.name}
            />
            <ProfileField
              icon={<Mail size={18} />}
              label="Registered Email Address"
              value={user.email}
            />
            <ProfileField
              icon={<Shield size={18} />}
              label="Security Clearance Role"
              value={user.role}
            />
            <ProfileField
              icon={<Calendar size={18} />}
              label="System Onboarding Date"
              value={user.joined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function ProfileField({ icon, label, value }: ProfileFieldProps) {
  return (
    <div className="group p-5 rounded-2xl border border-gray-50 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/20 hover:border-gray-100 dark:hover:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-all">
      <div className="flex items-center gap-3 mb-1.5 text-gray-400 dark:text-slate-500">
        <span className="text-nova-navy/40 dark:text-slate-400 group-hover:text-nova-gold transition-colors">
          {icon}
        </span>
        <span className="text-[10px] font-black uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-nova-navy dark:text-white font-bold text-sm ml-7.5 break-all">
        {value}
      </p>
    </div>
  );
}
