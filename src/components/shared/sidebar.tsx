"use client";
import "../../app/globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Wallet,
  TrendingUp,
  Scale,
  Settings,
  LogOut,
  Briefcase,
} from "lucide-react";
import { useContext, useState } from "react";
import { authContext } from "@/context/authContext";
import CircularProgress from "@mui/material/CircularProgress";

export default function Sidebar() {
  const [loading, setLoading] = useState(false);
  //   const { logout } = useContext(authContext);
  const router = useRouter();
  const location = usePathname();

  const handleLogout = () => {
    setLoading(true);
    // logout();
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  const isActive = (path: string) => location === path;

  return (
    <nav className="w-20 border-r border-gray-100 bg-white flex flex-col items-center py-8 gap-2 shadow-sm h-full ">
      <SidebarIcon
        to="/dashboard"
        icon={<LayoutDashboard size={24} />}
        active={isActive("/dashboard")}
        label="Dashboard"
      />

      <SidebarIcon
        to="/accounts"
        icon={<Wallet size={24} />}
        active={isActive("/accounts")}
        label="Accounts"
      />

      <SidebarIcon
        to="/ledger"
        icon={<FileText size={24} />}
        active={isActive("/ledger")}
        label="Ledger"
      />

      <div className="w-8 h-[1px] bg-gray-100 my-4"></div>

      <SidebarIcon
        to="/pnl"
        icon={<TrendingUp size={24} />}
        active={isActive("/pnl")}
        label="Profit & Loss"
      />

      <SidebarIcon
        to="/reports"
        icon={<Scale size={24} />}
        active={isActive("/reports")}
        label="Balance Sheet"
      />

      <div className="mt-auto flex flex-col items-center ">
        <SidebarIcon
          to="/settings"
          icon={<Settings size={24} />}
          active={isActive("/settings")}
          label="Settings"
        />

        <button
          title="Logout"
          onClick={handleLogout}
          disabled={loading}
          className="cursor-pointer p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <LogOut size={24} />
          )}
        </button>
      </div>
    </nav>
  );
}

function SidebarIcon({ to, icon, active, label }) {
  return (
    <Link
      href={to}
      title={label}
      className={`p-2 rounded-2xl transition-all duration-300 group  ${
        active
          ? "bg-nova-navy text-white shadow-lg shadow-nova-navy/20 scale-110"
          : "text-gray-400 hover:text-nova-navy hover:bg-gray-50"
      }`}
    >
      {icon}
      {active && (
        <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-nova-gold rounded-full" />
      )}
    </Link>
  );
}
