import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // 1. Protect Admin Routes
    // 1. Protect Admin Routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const basicAuth = request.headers.get('authorization')
        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1]
            const [user, pwd] = atob(authValue).split(':')
            // Hardcoded credentials for MVP - change immediately in production
            if (user === 'admin' && pwd === (process.env.ADMIN_SECRET || 'fortress2024')) {
                return NextResponse.next()
            }
        }
        return new NextResponse('Auth Required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        })
    }

    // 2. Protect Seed Endpoint
    if (request.nextUrl.pathname.startsWith('/api/seed')) {
        // Require a secret key in header
        const authHeader = request.headers.get('x-admin-secret');
        const validSecret = process.env.ADMIN_SECRET || 'fortress2024';
        if (authHeader !== validSecret) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/api/seed'],
}
