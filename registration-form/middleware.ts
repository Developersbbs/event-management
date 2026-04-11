import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Only protect /admin routes
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('admin_token')?.value

        // No token → redirect
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        try {
            const secret = new TextEncoder().encode(
                process.env.JWT_SECRET || 'default-secret-change-me'
            )

            const { payload } = await jwtVerify(token, secret)

            // IMPORTANT: ROLE CHECK
            const role = payload.role as string

            if (!role || (role !== 'admin' && role !== 'super-admin')) {
                return NextResponse.redirect(new URL('/unauthorized', request.url))
            }

            return NextResponse.next()

        } catch (error) {
            console.error("Middleware auth error:", error)

            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}