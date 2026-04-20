"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import {
  getDashboardPath,
  getExpectedRoleFromPath,
  resolvePortalRole,
} from "@/lib/portal-access";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  BookOpen,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/portal/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Data Akun", href: "/portal/admin/accounts", icon: <Users className="w-5 h-5" /> },
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

// ─── Sidebar skeleton shown while loading ──────────────────────────────────
const PROFILE_CACHE_KEY = "msa.portal.profile";
const LAST_ACTIVITY_KEY = "msa.portal.lastActivity";
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"] as const;

const readCachedProfile = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
};

const writeCachedProfile = (profile: Profile) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
};

const clearPortalCache = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PROFILE_CACHE_KEY);
  window.localStorage.removeItem(LAST_ACTIVITY_KEY);
};

const fallbackProfile = (
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
  role: Profile["role"]
): Profile => ({
  id: user.id,
  role,
  full_name:
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
    user.email?.split("@")[0] ||
    "User",
  email: user.email ?? "",
  whatsapp: null,
  avatar_url: null,
  created_at: new Date().toISOString(),
});

function NavSkeleton() {
  return (
    <div className="flex-1 p-4 space-y-2 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      ))}
    </div>
  );
}

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
  const logoutStartedRef = useRef(false);
  const lastActivityWriteRef = useRef(0);

  // ✅ FIX: Memoize supabase client — prevents new instance every render
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    const getProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
          clearPortalCache();
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }
        logoutStartedRef.current = false;

        const profileResult = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        const data = profileResult.data as Profile | null;

        const role = resolvePortalRole({
          profileRole: data?.role,
          email: user.email,
          metadata: user.user_metadata,
        });

        if (!role) {
          clearPortalCache();
          await supabase.auth.signOut({ scope: "local" });
          router.replace("/portal/login");
          return;
        }

        const expectedRole = getExpectedRoleFromPath(pathname);
        if (expectedRole && expectedRole !== role) {
          router.replace(getDashboardPath(role));
          return;
        }

        if (mounted) {
          const nextProfile =
            data
              ? ({ ...data, role } as Profile)
              : fallbackProfile(user, role);
          writeCachedProfile(nextProfile);
          setProfile(nextProfile);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };

    const cachedProfile = readCachedProfile();
    if (cachedProfile) {
      setProfile(cachedProfile);
      setLoading(false);
    }

    getProfile();

    // ✅ FIX: Listen to auth state changes to prevent random logouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          clearPortalCache();
          router.replace("/portal/login");
        }
        if (event === "TOKEN_REFRESHED" && session && mounted) {
          // Session refreshed silently — no action needed
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  // ✅ FIX: useCallback prevents new function reference every render
  const handleLogout = useCallback(async () => {
    if (logoutStartedRef.current) return;
    logoutStartedRef.current = true;
    clearPortalCache();
    setProfile(null);
    router.replace("/portal/login");
    await supabase.auth.signOut({ scope: "local" });
  }, [supabase, router]);

  useEffect(() => {
    if (pathname === "/portal/login" || typeof window === "undefined") return;

    const markActivity = () => {
      const now = Date.now();
      if (now - lastActivityWriteRef.current < 1000) return;
      lastActivityWriteRef.current = now;
      window.localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    };

    const logoutForIdle = () => {
      void handleLogout();
    };

    markActivity();
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, markActivity, { passive: true });
    });

    const interval = window.setInterval(() => {
      const lastActivity = Number(window.localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
      if (Date.now() - lastActivity >= IDLE_TIMEOUT_MS) {
        logoutForIdle();
      }
    }, 30000);

    const onStorage = (event: StorageEvent) => {
      if (event.key === LAST_ACTIVITY_KEY && event.newValue === null) {
        logoutForIdle();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", onStorage);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, markActivity);
      });
    };
  }, [handleLogout, pathname]);

  // ✅ FIX: Better active state — handles sub-routes like /portal/parent/journal
  const isActive = useCallback(
    (href: string) => {
      if (pathname === href) return true;
      // Avoid matching /portal/parent for /portal/parent/journal
      const isRoot =
        href === "/portal/admin" ||
        href === "/portal/teacher" ||
        href === "/portal/parent";
      if (isRoot) return pathname === href;
      return pathname.startsWith(href + "/") || pathname === href;
    },
    [pathname]
  );

  // Don't show sidebar on login page
  if (pathname === "/portal/login") {
    return <>{children}</>;
  }

  const navItems = !profile
    ? []
    : profile.role === "admin"
    ? ADMIN_NAV
    : profile.role === "teacher"
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

  // ✅ FIX: No early return on loading — show full layout with skeleton
  // This ensures mobile header & hamburger are always visible

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center shadow-lg`}
            >
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

        {/* Navigation or Skeleton */}
        {loading ? (
          <NavSkeleton />
        ) : (
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? `bg-gradient-to-r ${roleColor} text-white shadow-md`
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>
        )}

        {/* User Card */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          {loading ? (
            <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}
              >
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
          )}

          <Link
            href="/"
            className="flex items-center gap-2 mt-3 px-4 py-2 text-xs text-slate-400 hover:text-sky-500 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Kembali ke Website
          </Link>
        </div>
      </aside>

      {/* ── Mobile Header ───────────────────────────────────────────── */}
      {/* ✅ FIX: Always shown — not blocked by loading state */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleColor} flex items-center justify-center`}
            >
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-white">
              MSA Portal
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 dark:text-slate-400"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Sidebar Overlay ───────────────────────────────────── */}
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
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center`}
                  >
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 dark:text-white text-sm">
                      MSA Education
                    </h2>
                    <p className="text-xs text-slate-400">Learning Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {loading ? (
                  <NavSkeleton />
                ) : (
                  navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? `bg-gradient-to-r ${roleColor} text-white shadow-md`
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                        {active && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </Link>
                    );
                  })
                )}
              </nav>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                {!loading && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                    >
                      {profile?.full_name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {profile?.full_name}
                      </p>
                      <p className="text-xs text-slate-400">{roleLabel}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <Link
                  href="/"
                  className="flex items-center gap-2 mt-3 px-4 py-2 text-xs text-slate-400 hover:text-sky-500 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  Kembali ke Website
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-48 bg-slate-100 dark:bg-slate-700 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"
                  />
                ))}
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
