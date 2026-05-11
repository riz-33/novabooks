"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Bell,
  User,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/* 🔐 ROLE BASED MENU */
const navConfig = {
  user: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Accounts", href: "/accounts", icon: Wallet },
    { name: "Ledger", href: "/ledger", icon: BookOpen },
  ],
  admin: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Accounts", href: "/accounts", icon: Wallet },
    { name: "Ledger", href: "/ledger", icon: BookOpen },
    { name: "P&L", href: "/pnl", icon: PieChart },
    { name: "Balance Sheet", href: "/balance-sheet", icon: FileText },
  ],
};

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  /* 🔧 STATES */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [role] = useState("admin"); // later from backend
  const navItems = navConfig[role];

  const isActive = (path) => pathname === path;

  /* 🌙 Dark Mode (persist + html class) */
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === "dark";
    setDarkMode(isDark);

    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* 📌 Sidebar persistence */
  useEffect(() => {
    const stored = localStorage.getItem("sidebar");
    if (stored) setSidebarOpen(stored === "open");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar", sidebarOpen ? "open" : "closed");
  }, [sidebarOpen]);

  /* 🖱️ Outside Click */
  const userRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* 🔁 Toggle helpers */
  const toggleUserMenu = () => {
    setUserMenu((prev) => !prev);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen((prev) => !prev);
    setUserMenu(false);
  };

  /* 🔔 Notifications */
  const notifications = [
    "New transaction added",
    "Balance updated",
    "Monthly report ready",
  ];

  /* 📄 Page title */
  const allRoutes = [
    ...navConfig.admin,
    { name: "Settings", href: "/settings" },
  ];

  const currentPage =
    allRoutes.find((item) => item.href === pathname)?.name || "Dashboard";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* 🔷 SIDEBAR */}
      <motion.aside
        animate={{ width: sidebarOpen ? 220 : 60 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-slate-800 border-r flex flex-col"
      >
        {/* Toggle */}
        <div className="flex items-center justify-left h-16 border-b px-4">
          <button
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className=" cursor-pointer " />
          </button>
        </div>

        <div className="flex flex-col gap-2 p-2 mt-4">
          {navItems.map((item) => (
            <SidebarLink
              key={item.name}
              item={item}
              active={isActive(item.href)}
              expanded={sidebarOpen}
            />
          ))}

          <div className="border-t my-2" />

          <SidebarLink
            item={{ name: "Settings", href: "/settings", icon: Settings }}
            active={isActive("/settings")}
            expanded={sidebarOpen}
          />
        </div>
      </motion.aside>

      {/* 🔷 MAIN */}
      <div className="flex-1 flex flex-col">
        {/* 🔹 TOPBAR */}
        <div className="flex items-center justify-between px-6 h-16 bg-white dark:bg-slate-800 border-b">
          <div className="flex items-center gap-4">
            <Image
              src="/logo7.png"
              alt="NovaBooks Logo"
              width={150}
              height={32}
              className="cursor-pointer"
            />

            {/* <h1 className="font-bold text-lg dark:text-white">{currentPage}</h1> */}
          </div>

          <div className="flex items-center gap-4">
            {/* 🌙 Dark Mode */}
            <button
              aria-label="Toggle dark mode"
              onClick={() => setDarkMode(!darkMode)}
              className="cursor-pointer"
            >
              {darkMode ? <Sun /> : <Moon />}
            </button>

            {/* 🔔 Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                className="relative"
                aria-label="Notifications"
              >
                <Bell />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white px-1 rounded-full">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 shadow-xl backdrop-blur-md rounded-xl p-4"
                  >
                    <p className="font-bold mb-2">Notifications</p>
                    <ul className="text-sm space-y-2">
                      {notifications.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 👤 USER MENU */}
            <div className="relative" ref={userRef}>
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-2"
              >
                <User />
                <ChevronDown size={16} />
              </button>

              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 shadow-xl backdrop-blur-md rounded-xl p-2"
                  >
                    <Link
                      href="/profile"
                      className="block p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                    >
                      Settings
                    </Link>
                    <button className="w-full text-left p-2 hover:bg-red-50 text-red-500 rounded">
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 🔹 CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 dark:text-white">
          {children}
        </main>
      </div>
    </div>
  );
}

/* 🔹 Sidebar Link */
function SidebarLink({ item, active, expanded }) {
  return (
    <Link
      href={item.href}
      className={`relative flex items-center ${
        expanded ? "justify-start" : "justify-center"
      } gap-3 p-3 rounded-xl group transition
      ${
        active
          ? "bg-nova-navy text-white"
          : "text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
      }`}
    >
      <item.icon size={20} />

      {expanded && <span>{item.name}</span>}

      {!expanded && (
        <span className="absolute left-full ml-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
          {item.name}
        </span>
      )}
    </Link>
  );
}
