import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export type AuthUser = {
    id: string
    role: string
    email: string
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) return null

    try {
        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'default-secret-change-me'
        )
        const { payload } = await jwtVerify(token, secret)

        return {
            id: payload.sub as string,
            role: payload.role as string,
            email: payload.email as string
        }
    } catch (error) {
        return null
    }
}
