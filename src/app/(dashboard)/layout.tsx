"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  BookOpen,
  FileText,
  PieChart,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
} from "lucide-react";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Ledger", href: "/ledger", icon: BookOpen },
  // { name: "P&L", href: "/pnl", icon: PieChart },
  // { name: "Balance Sheet", href: "/balance-sheet", icon: FileText },
  // { name: "Settings", href: "/settings", icon: Settings },
];

const navItems2 = [
  // { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  // { name: "Accounts", href: "/accounts", icon: Wallet },
  // { name: "Ledger", href: "/ledger", icon: BookOpen },
  { name: "P&L", href: "/pnl", icon: PieChart },
  { name: "Balance Sheet", href: "/balance-sheet", icon: FileText },
  // { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const Active = (path: string) => pathname === path;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Main Content Area */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex-shrink-0 flex items-center gap-2"
              >
                <Image
                  className="mx-auto mb-4 object-contain"
                  src={"/logo2.png"}
                  alt="NovaBooks"
                  width={100}
                  height={60}
                />
                <span className="text-xl font-black text-nova-navy tracking-tighter hidden sm:block">
                  NOVABOOKS
                </span>
              </Link>
            </div>

            {/* {user && ( */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                // const isActive = pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    href={item.href}
                    icon={<item.icon size={18} />}
                    label={item.name}
                  />
                );
              })}
            </div>
            {/* )} */}

            <div className="hidden md:flex items-center space-x-4">
              {/* {user ? ( */}
              <>
                <button className="cursor-pointer text-gray-400 hover:text-nova-gold transition-colors">
                  <Bell size={20} />
                </button>
                <button className="cursor-pointer p-2 text-gray-400 hover:text-nova-gold transition-colors">
                  <User size={20} />
                </button>

                <div className="h-8 w-[1px] bg-gray-200"></div>
                <button
                  // onClick={handleLogout}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-nova-navy rounded-xl hover:bg-blue-900 transition-all shadow-md active:scale-95"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
              {/* ) : ( */}
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-sm font-bold text-nova-navy hover:text-nova-gold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-nova-navy rounded-xl shadow-lg hover:shadow-nova-navy/20 transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </div>
              {/* )} */}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-nova-navy p-2 rounded-lg hover:bg-gray-50"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl">
            {/* {user ? ( */}
            <>
              <MobileNavLink
                href="/dashboard"
                label="Dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink
                href="/ledger"
                label="Ledger"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <button
                // onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 font-bold bg-red-50 rounded-xl"
              >
                Logout
              </button>
            </>
            {/* ) : ( */}
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-3 font-bold text-nova-navy"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="w-full text-center py-3 font-bold bg-nova-navy text-white rounded-xl"
              >
                Register
              </Link>
            </div>
            {/* )} */}
          </div>
        )}
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}

        <nav className="w-20 border-r border-gray-100 bg-white flex flex-col items-center py-8 gap-2 shadow-sm h-full ">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? "bg-nova-navy text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-400 hover:bg-slate-50 hover:text-nova-navy"
                }`}
              >
                <item.icon size={20} />
                {/* {item.name} */}
              </Link>
            );
          })}

          <div className="w-8 h-[1px] bg-gray-100 my-4"></div>

          {navItems2.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? "bg-nova-navy text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-400 hover:bg-slate-50 hover:text-nova-navy"
                }`}
              >
                <item.icon size={20} />
                {/* {item.name} */}
              </Link>
            );
          })}

          <div className="w-8 h-[1px] bg-gray-100 my-4"></div>

          <Link
            href="/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              Active("/settings")
                ? "bg-nova-navy text-white shadow-lg shadow-blue-900/20"
                : "text-slate-400 hover:bg-slate-50 hover:text-nova-navy"
            }`}
          >
            {<Settings size={20} />}
          </Link>

          <button
            title="Logout"
            // onClick={handleLogout}
            // disabled={loading}
            className="cursor-pointer p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            {/* {loading ? ( */}
            {/* <CircularProgress size={20} color="inherit" /> */}
            {/* ) : ( */}
            <LogOut size={20} />
            {/* )} */}
          </button>
        </nav>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
function NavLink({ href, icon, label }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-nova-navy transition-colors group"
    >
      <span className="text-gray-400 group-hover:text-nova-gold transition-colors">
        {icon}
      </span>
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-base font-bold text-nova-navy hover:bg-gray-50 rounded-xl"
    >
      {label}
    </Link>
  );
}
