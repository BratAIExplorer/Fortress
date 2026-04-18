import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 1. Skip logic: Don't track API routes, internal Next.js calls, or static files
  const isApi = pathname.startsWith('/api');
  const isInternal = pathname.startsWith('/_next');
  const isStatic = pathname.includes('.') || pathname.startsWith('/favicon.ico');
  
  if (!isApi && !isInternal && !isStatic) {
    // 2. Fire-and-forget tracking
    // Using absolute URL to ensure it reaches the API correctly
    const trackUrl = new URL('/api/analytics/page-view', req.url);
    
    // Non-blocking fetch
    fetch(trackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.headers.get('user-agent') || '',
        'Referer': req.headers.get('referer') || '',
      },
      body: JSON.stringify({
        pagePath: pathname,
      }),
    }).catch(err => {
      // Intentionally silent in production, logging for dev
      if (process.env.NODE_ENV === 'development') {
        console.error("Tracking failed:", err);
      }
    });
  }

  // NextAuth v5 'auth' middleware automatically handles redirects
  // based on the 'authorized' callback in auth.ts
  return NextResponse.next();
});

export const config = {
  // Apply middleware to all routes except specifically excluded ones
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
