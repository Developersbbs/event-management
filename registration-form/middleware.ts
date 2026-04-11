import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // Get current user
    const user = await getCurrentUser()

    // Public routes - no authentication required
    const publicRoutes = ['/login', '/register']
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    // If no user, redirect to login
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
        // Only admin and super-admin can access admin routes
        if (user.role !== 'admin' && user.role !== 'super-admin') {
            // Regular users trying to access admin - redirect to register
            return NextResponse.redirect(new URL('/register', request.url))
        }
    }

    // Regular users - only allow register page
    if (user.role === 'user' && !pathname.startsWith('/register')) {
        return NextResponse.redirect(new URL('/register', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}