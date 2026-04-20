import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getDashboardPath,
  getExpectedRoleFromPath,
  resolvePortalRole,
} from "@/lib/portal-access";

async function getPortalRole(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null }
) {
  const fastRole = resolvePortalRole({
    email: user.email,
    metadata: user.user_metadata,
  });
  if (fastRole) return fastRole;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return resolvePortalRole({
    profileRole: profile?.role,
    email: user.email,
    metadata: user.user_metadata,
  });
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect portal routes (except login)
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/portal") &&
    !request.nextUrl.pathname.startsWith("/portal/login")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal/login";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === "/portal") {
    const role = await getPortalRole(supabase, user);
    const url = request.nextUrl.clone();
    url.pathname = role ? getDashboardPath(role) : "/portal/login";
    return NextResponse.redirect(url);
  }

  // If logged in and trying to access login page, redirect to appropriate dashboard
  if (user && request.nextUrl.pathname === "/portal/login") {
    const url = request.nextUrl.clone();
    const role = await getPortalRole(supabase, user);
    url.pathname = role ? getDashboardPath(role) : "/portal/login";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname.startsWith("/portal")) {
    const expectedRole = getExpectedRoleFromPath(request.nextUrl.pathname);

    if (expectedRole) {
      const role = await getPortalRole(supabase, user);

      if (role && role !== expectedRole) {
        const url = request.nextUrl.clone();
        url.pathname = getDashboardPath(role);
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
