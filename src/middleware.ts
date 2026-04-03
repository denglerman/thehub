import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // If not authenticated and trying to access protected routes
  if (!user && (pathname.startsWith("/hub") || pathname.startsWith("/onboarding"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If authenticated and on login page, redirect based on onboarding status
  if (user && pathname === "/") {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("onboarded")
      .eq("user_id", user.id)
      .single();

    if (!profile || !profile.onboarded) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return NextResponse.redirect(new URL("/hub", request.url));
  }

  // If authenticated and on onboarding but already onboarded
  if (user && pathname === "/onboarding") {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("onboarded")
      .eq("user_id", user.id)
      .single();

    if (profile?.onboarded) {
      return NextResponse.redirect(new URL("/hub", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/hub/:path*", "/onboarding"],
};
