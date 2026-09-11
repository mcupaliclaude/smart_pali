import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { CURRENT_PATH_HEADER } from "@/shared/lib/security/callback-url";

const PUBLIC_PREFIXES = ["/portal", "/reset-password/", "/verify-email/", "/api/auth/", "/api/health", "/_next/", "/favicon.ico", "/uploads/", "/images/"];
const GUEST_ONLY = ["/login", "/forgot-password"];

/** ด่านตรวจระดับ route — ไม่แตะ DB (edge) · สิทธิ์ละเอียดตรวจใน Server Action ผ่าน requirePermission */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const hasSecureCookie = req.cookies.has("__Secure-authjs.session-token");
  const isHttps = (process.env.APP_URL ?? "").startsWith("https://")
    || req.nextUrl.protocol === "https:"
    || req.headers.get("x-forwarded-proto") === "https";
  const secureCookie = hasSecureCookie || isHttps;

  let token = await getToken({ req, secret: process.env.AUTH_SECRET, secureCookie });
  if (!token) {
    token = await getToken({ req, secret: process.env.AUTH_SECRET, secureCookie: !secureCookie });
  }
  const loggedIn = !!token && !token.invalid && !!token.userId;

  if (GUEST_ONLY.includes(pathname)) {
    return loggedIn ? NextResponse.redirect(new URL("/dashboard", req.url)) : NextResponse.next();
  }
  if (pathname === "/") {
    return NextResponse.redirect(new URL(loggedIn ? "/dashboard" : "/portal", req.url));
  }
  if (!loggedIn) {
    // ถ้าเป็น Server Action หรือ RSC payload request: ปล่อยให้ handler จัดการ
    // เพื่อให้ requireSession ใช้ next/navigation redirect() ที่ส่ง X-Action-Redirect
    // หรือ x-nextjs-redirect อย่างถูกต้อง ไม่ทำให้ client crash จากการรับ HTML
    const isRsc = req.headers.has("next-action") || req.headers.has("rsc") || req.headers.get("accept")?.includes("text/x-component");
    if (isRsc) {
      const headers = new Headers(req.headers);
      headers.set(CURRENT_PATH_HEADER, pathname + search);
      return NextResponse.next({ request: { headers } });
    }

    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(login, 303);
  }
  if (token?.mustChangePassword && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", req.url));
  }
  // B1.5: ด่านนี้อยู่บน edge จึงมองไม่เห็นว่าเซสชันถูกเพิกถอนไปแล้ว (ต้องแตะ DB) คำขอแรกหลังถูกเพิกถอน
  // จึงผ่านมาถึงเพจเสมอ แล้วไปตายที่ requireSession — ส่งเส้นทางปัจจุบันไปให้ requireSession เอาไว้ทำ
  // callbackUrl ตอนเด้งกลับหน้า login · ทับค่าเดิมเสมอ ไม่ให้ client ปลอม header นี้ส่งเข้ามาได้
  const headers = new Headers(req.headers);
  headers.set(CURRENT_PATH_HEADER, pathname + search);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
