import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * รีเฟรช session cookie ของ Supabase ทุกคำขอ
 * และส่งคนที่ยังไม่ล็อกอินไปหน้า /login
 */
export async function updateSession(request: NextRequest) {
  // ยังไม่ได้ตั้งค่า .env.local → ส่งทุกหน้าไป /login ซึ่งแสดงคำแนะนำการตั้งค่า
  // (หน้าอื่นจะไม่ถูกวาด จึงไม่เกิด error จากการสร้าง Supabase client)
  if (!isSupabaseConfigured) {
    if (request.nextUrl.pathname.startsWith("/login")) {
      return NextResponse.next({ request });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // ห้ามมีโค้ดอื่นคั่นระหว่าง createServerClient กับ getClaims
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/login");

  if (!isLoggedIn && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
