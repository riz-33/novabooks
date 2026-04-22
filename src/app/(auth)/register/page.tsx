"use client";

import React, { useState } from "react"; // Added useState
import Link from "next/link";
import { useRouter } from "next/navigation"; // Added useRouter
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter(); // Initialize router

  // 1. Setup State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData), // Use formData state
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        alert("Success! Now please login.");
        router.push("/login");
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-nova-navy tracking-tighter">
            NOVABOOKS
          </h1>
          <p className="text-nova-gold font-bold text-xs uppercase tracking-[0.2em] mt-2">
            Join the Modern Ledger
          </p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5">
          <h2 className="text-2xl font-black text-nova-navy mb-2">
            Create Account
          </h2>
          <p className="text-gray-400 text-sm mb-8 font-medium">
            Start managing your business finances today.
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            <AuthInput
              icon={<User size={18} />}
              label="Full Name"
              placeholder="Muhammad Rizwan"
              type="text"
              value={formData.name}
              onChange={(e: any) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <AuthInput
              icon={<Mail size={18} />}
              label="Email Address"
              placeholder="rizwan@example.com"
              type="email"
              value={formData.email}
              onChange={(e: any) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <AuthInput
              icon={<Lock size={18} />}
              label="Create Password"
              placeholder="••••••••"
              type="password"
              value={formData.password}
              onChange={(e: any) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-nova-navy text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Get Started"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400 font-medium">
            Already a member?{" "}
            <Link
              href="/login"
              className="text-nova-navy font-black hover:text-nova-gold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Updated AuthInput to handle values and changes
function AuthInput({ icon, label, placeholder, type, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          required
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-nova-navy/10 text-nova-navy font-bold placeholder:text-gray-300 transition-all"
        />
      </div>
    </div>
  );
}
