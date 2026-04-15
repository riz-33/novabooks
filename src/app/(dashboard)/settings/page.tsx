"use client";
import React from "react";
import { Bell, Globe, Lock, Moon, CreditCard } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-novaNavy">Settings</h1>
        <p className="text-novaGold font-medium">
          Configure NovaBooks to fit your workflow.
        </p>
      </div>

      <div className="space-y-6">
        <SettingSection title="Preferences">
          <ToggleItem
            icon={<Moon />}
            label="Dark Mode"
            description="Switch to a dark interface."
            enabled={false}
          />
          <ToggleItem
            icon={<Globe />}
            label="Currency"
            description="Default currency for reports (USD)."
            enabled={true}
          />
        </SettingSection>

        <SettingSection title="Notifications">
          <ToggleItem
            icon={<Bell />}
            label="Ledger Alerts"
            description="Notify on high-value transactions."
            enabled={true}
          />
          <ToggleItem
            icon={<CreditCard />}
            label="Invoice Reminders"
            description="Auto-notify clients for unpaid bills."
            enabled={true}
          />
        </SettingSection>

        <SettingSection title="Security">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-100 rounded-xl text-novaNavy">
                <Lock size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-novaNavy">
                  Change Password
                </p>
                <p className="text-xs text-gray-400">
                  Last changed 3 months ago.
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-novaGold">UPDATE</span>
          </button>
        </SettingSection>
      </div>
    </div>
  );
}

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
          {title}
        </h2>
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

function ToggleItem({ icon, label, description, enabled }: any) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <div className="text-gray-400">{icon}</div>
        <div>
          <p className="text-sm font-bold text-novaNavy">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <div
        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${enabled ? "bg-novaNavy" : "bg-gray-200"}`}
      >
        <div
          className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${enabled ? "left-6" : "left-1"}`}
        />
      </div>
    </div>
  );
}
