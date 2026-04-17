"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  UserPlus,
  BookOpen,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/portal/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Data Akun", href: "/portal/admin#accounts", icon: <Users className="w-5 h-5" /> },
];

const TEACHER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/portal/teacher", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Murid Saya", href: "/portal/teacher/students", icon: <Users className="w-5 h-5" /> },
  { label: "Entri Harian", href: "/portal/teacher/entries", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Laporan", href: "/portal/teacher/reports", icon: <FileText className="w-5 h-5" /> },
];

const PARENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/portal/parent", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Jurnal Anak", href: "/portal/parent/journal", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Laporan", href: "/portal/parent/reports", icon: <FileText className="w-5 h-5" /> },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
      }
      setLoading(false);
    };

    getProfile();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/portal/login");
    router.refresh();
  };

  // Don't show sidebar on login page
  if (pathname === "/portal/login") {
    return <>{children}</>;
  }

  const navItems =
    profile?.role === "admin"
      ? ADMIN_NAV
      : profile?.role === "teacher"
      ? TEACHER_NAV
      : PARENT_NAV;

  const roleLabel =
    profile?.role === "admin"
      ? "Kepala Sekolah"
      : profile?.role === "teacher"
      ? "Guru"
      : "Orang Tua";

  const roleColor =
    profile?.role === "admin"
      ? "from-indigo-500 to-purple-600"
      : profile?.role === "teacher"
      ? "from-sky-500 to-teal-500"
      : "from-emerald-500 to-green-600";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center shadow-lg`}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white text-sm">
                MSA Education
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Learning Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${roleColor} text-white shadow-md`
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white font-bold text-sm`}>
              {profile?.full_name?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {roleLabel}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Back to Website */}
          <Link
            href="/"
            className="flex items-center gap-2 mt-3 px-4 py-2 text-xs text-slate-400 hover:text-sky-500 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Kembali ke Website
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleColor} flex items-center justify-center`}>
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-white">
              MSA Portal
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 dark:text-slate-400"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-xl"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center`}>
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 dark:text-white text-sm">MSA Education</h2>
                    <p className="text-xs text-slate-400">Learning Portal</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? `bg-gradient-to-r ${roleColor} text-white shadow-md`
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white font-bold text-sm`}>
                    {profile?.full_name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{profile?.full_name}</p>
                    <p className="text-xs text-slate-400">{roleLabel}</p>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
