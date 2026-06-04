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
import Cookies from "js-cookie";

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = "admin";
  const navItems = navConfig[role];

  const isActive = (path) => pathname === path;

  const getUser = async () => {
    const token = Cookies.get("token") || localStorage.getItem("token");

    try {
      const res = await fetch("/api/auth/login", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();
      if (data && data.user) {
        setUser(data.user);
        console.log("User state successfully set to:", data.user);
      } else {
        throw new Error("User object missing from API response payload");
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  console.log("Current user state:", user); // Debug log
  useEffect(() => {
    setMobileSidebarOpen(false); // close mobile sidebar on desktop toggle
  }, [pathname]);

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

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* 🔷 SIDEBAR */}
      <>
        {/* 🔷 MOBILE OVERLAY */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* 🔷 DESKTOP SIDEBAR */}
        <motion.aside
          animate={{ width: sidebarOpen ? 220 : 60 }}
          transition={{ duration: 0.25 }}
          className="hidden md:flex bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col"
        >
          {/* Toggle */}
          <div className="flex items-center justify-start h-16 border-b px-4">
            <button
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="cursor-pointer text-slate-600 dark:text-slate-300"
            >
              <Menu />
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
              item={{
                name: "Settings",
                href: "/settings",
                icon: Settings,
              }}
              active={isActive("/settings")}
              expanded={sidebarOpen}
            />
          </div>
        </motion.aside>

        {/* 🔷 MOBILE SIDEBAR */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25 }}
              className="fixed top-0 left-0 z-50 w-64 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between h-16 px-4 border-b">
                <h2 className="font-bold dark:text-white">NOVABOOKS</h2>

                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Nav */}
              <div className="flex flex-col gap-2 p-3 mt-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 p-3 rounded-xl transition
              ${
                isActive(item.href)
                  ? "bg-nova-navy text-white"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                ))}

                <div className="border-t my-2" />

                <Link
                  href="/settings"
                  className={`flex items-center gap-3 p-3 rounded-xl transition
            ${
              isActive("/settings")
                ? "bg-nova-navy text-white"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </Link>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </>

      {/* 🔷 MAIN */}
      <div className="flex-1 flex flex-col">
        {/* 🔹 TOPBAR */}
        <div className="flex items-center justify-between px-6 h-16 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-b border-slate-900 dark:border-slate-100">
          <div className="flex items-center gap-4">
            {/* 📱 Mobile Menu */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <Menu />
            </button>

            <Image
              src="/logo7.png"
              alt="NovaBooks Logo"
              width={150}
              height={32}
              className="cursor-pointer dark:brightness-50 dark:invert hidden md:block"
              onClick={() => (window.location.href = "/dashboard")}
            />

            {/* <div className="flex items-center gap-4"> */}

            {/* <h1 className="font-bold text-lg dark:text-white">{currentPage}</h1> */}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm ml-5">
              {loading ? (
                <span></span>
              ) : user ? (
                // 3. Render the username dynamically
                <span className="font-medium text-nova-navy dark:text-white">
                  Welcome, <strong>{user.name.toUpperCase()}</strong>
                </span>
              ) : (
                <span>Not logged in</span>
              )}
            </div>
            {/* 🌙 Dark Mode */}
            <button
              aria-label="Toggle dark mode"
              onClick={toggleDarkMode}
              className="cursor-pointer text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {darkMode ? <Sun /> : <Moon />}
            </button>

            {/* 🔔 Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                className="relative cursor-pointer text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
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
                    className="absolute right-0 top-12 w-72 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-xl backdrop-blur-md rounded-xl p-4 z-50 border border-slate-200 dark:border-slate-700"
                  >
                    <p className="font-bold mb-3 dark:text-white">
                      Notifications
                    </p>

                    <ul className="text-sm space-y-2">
                      {notifications.map((n, i) => (
                        <li
                          key={i}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        >
                          {n}
                        </li>
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
                className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
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
                    className="absolute right-0 top-11 w-52 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-xl backdrop-blur-md rounded-xl p-2 z-50 border border-slate-200 dark:border-slate-700"
                  >
                    <Link
                      href="/profile"
                      className="block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      Settings
                    </Link>

                    <button
                      className="w-full text-left p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                      onClick={() => {
                        Cookies.remove("token", { path: "/" });
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                      }}
                    >
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
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
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
