import type { UserRole } from "@/lib/supabase/types";

export const portalEmailRoles: Record<string, UserRole> = {
  "renanda.cindera.kh@gmail.com": "admin",
  "teacher.msa@gmail.com": "teacher",
  "renanda.maspion@gmail.com": "parent",
};

export function normalizeEmail(email?: string | null) {
  return (email ?? "").trim().toLowerCase();
}

export function isPortalRole(value: unknown): value is UserRole {
  return value === "admin" || value === "teacher" || value === "parent";
}

export function getRoleFromEmail(email?: string | null) {
  return portalEmailRoles[normalizeEmail(email)] ?? null;
}

export function getRoleFromMetadata(metadata?: Record<string, unknown> | null) {
  const role = metadata?.role;
  return isPortalRole(role) ? role : null;
}

export function resolvePortalRole({
  profileRole,
  email,
  metadata,
}: {
  profileRole?: unknown;
  email?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  return getRoleFromEmail(email) ?? (isPortalRole(profileRole) ? profileRole : null) ?? getRoleFromMetadata(metadata);
}

export function getDashboardPath(role: UserRole) {
  return `/portal/${role}`;
}

export function getExpectedRoleFromPath(pathname: string) {
  if (pathname.startsWith("/portal/admin")) return "admin" satisfies UserRole;
  if (pathname.startsWith("/portal/teacher")) return "teacher" satisfies UserRole;
  if (pathname.startsWith("/portal/parent")) return "parent" satisfies UserRole;
  return null;
}
