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
  User,
  Bell,
} from "lucide-react"; // Lightweight icons

import "../../app/globals.css";
import Image from "next/image";
import { authContext } from "@/context/authContext";
import Logo from "@/assets/logo.png";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Ledger", href: "/ledger", icon: BookOpen },
  { name: "P&L", href: "/pnl", icon: PieChart },
  { name: "Balance Sheet", href: "/balance-sheet", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  //   const { user, logout } = React.useContext(authContext);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // const handleLogout = () => {
  //   logout();
  //   router.push("/");
  // };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex-shrink-0 flex items-center gap-2"
            >
              <Image
                className="h-15 w-25"
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
            <NavLink
              href="/dashboard"
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
            />
            <NavLink
              href="/ledger"
              icon={<BookOpen size={18} />}
              label="Ledger"
            />
            <NavLink
              href="/profile"
              icon={<User size={18} />}
              label="Account"
            />
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
              onClick={() => setIsOpen(!isOpen)}
              className="text-nova-navy p-2 rounded-lg hover:bg-gray-50"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl">
          {/* {user ? ( */}
          <>
            <MobileNavLink
              href="/dashboard"
              label="Dashboard"
              onClick={() => setIsOpen(false)}
            />
            <MobileNavLink
              href="/ledger"
              label="Ledger"
              onClick={() => setIsOpen(false)}
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
  );
}

// Sub-components for cleaner code
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
