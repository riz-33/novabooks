"use client";
import React from "react";
import { User, Mail, Shield, Calendar, Edit3 } from "lucide-react";

export default function ProfilePage() {
  // In a real app, you'd get this from your AuthContext
  const user = {
    name: "Muhammad Rizwan",
    email: "rizwan@example.com",
    role: "Administrator",
    joined: "January 2026",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-novaNavy">Account Profile</h1>
          <p className="text-novaGold font-medium text-sm">
            Manage your personal identification.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-novaNavy hover:bg-gray-50 transition-all shadow-sm">
          <Edit3 size={16} /> Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Banner Decor */}
        <div className="h-32 bg-gradient-to-r from-novaNavy to-blue-800" />

        <div className="px-10 pb-10">
          <div className="relative flex justify-between items-end -mt-12 mb-8">
            <div className="p-1 bg-white rounded-[2rem]">
              <div className="h-24 w-24 bg-slate-100 rounded-[1.8rem] flex items-center justify-center text-novaNavy border-4 border-white shadow-inner">
                <User size={48} />
              </div>
            </div>
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
              Active Session
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProfileField
              icon={<User size={18} />}
              label="Full Name"
              value={user.name}
            />
            <ProfileField
              icon={<Mail size={18} />}
              label="Email Address"
              value={user.email}
            />
            <ProfileField
              icon={<Shield size={18} />}
              label="Security Role"
              value={user.role}
            />
            <ProfileField
              icon={<Calendar size={18} />}
              label="Member Since"
              value={user.joined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-slate-50/50 transition-all">
      <div className="flex items-center gap-3 mb-1 text-gray-400">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <p className="text-novaNavy font-bold ml-7">{value}</p>
    </div>
  );
}
