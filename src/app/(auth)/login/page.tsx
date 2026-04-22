"use client";

import Cookies from "js-cookie";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { showToast } from "nextjs-toast-notify";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        showToast.success("Logged in successfully!", {
          duration: 4000,
          // position: "top-right",
          transition: "bounceIn",
          progress: true,
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        Cookies.set("token", data.token, { expires: 1 });
        router.push("/dashboard");
      } else {
        showToast.error(data.error || "Something went wrong", {
          duration: 4000,
          // position: "top-right",
          transition: "bounceIn",
          progress: true,
        });
      }
    } catch (err) {
      showToast.error("An error occurred. Please try again.", {
        duration: 4000,
        // position: "top-right",
        transition: "bounceIn",
        progress: true,
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo / Brand */}
        <div className="text-center mb-4">
          <Image
            className="mx-auto mb-4 object-contain"
            src="/logo2.png"
            alt="NovaBooks"
            width={150} // Slightly larger for better visibility
            height={80}
            priority// Adds a performance boost for the logo
          />
          <h1 className="text-4xl font-black text-nova-navy tracking-tighter">
            NOVABOOKS
          </h1>
          <p className="text-nova-gold font-bold text-xs uppercase tracking-[0.2em] mt-2">
            Finance Management System
          </p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5">
          <h2 className="text-2xl font-black text-nova-navy mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-sm mb-8 font-medium">
            Please enter your details to sign in.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <AuthInput
              icon={<Mail size={18} />}
              label="Email Address"
              placeholder="name@company.com"
              type="email"
              value={formData.email}
              onChange={(e: any) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <AuthInput
              icon={<Lock size={18} />}
              label="Password"
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
              className="w-full bg-nova-navy text-white py-2 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-nova-navy font-black hover:text-nova-gold transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          className="w-full pl-12 pr-4 py-2 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-nova-navy/10 text-nova-navy font-bold placeholder:text-gray-300 transition-all"
        />
      </div>
    </div>
  );
}
