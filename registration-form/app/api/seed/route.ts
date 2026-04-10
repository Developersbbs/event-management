import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function POST(req: NextRequest) {
    try {
        const seedSecret = process.env.SEED_SECRET
        const requestSecret = req.headers.get("x-seed-secret")

        if (!seedSecret || requestSecret !== seedSecret) {
            return NextResponse.json({ error: "Unauthorized: Invalid or missing secret header" }, { status: 401 })
        }

        const body = await req.json().catch(() => ({}))
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({ error: "Missing email or password in body" }, { status: 400 })
        }

        await dbConnect()

        // Check if user exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            // Optional: Update password? For logic safety simple return exists for now
            return NextResponse.json({ message: "User already exists", email }, { status: 409 })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newAdmin = new User({
            email,
            password: hashedPassword,
            role: "super-admin",
        })

        await newAdmin.save()

        return NextResponse.json(
            { message: "Super admin created successfully", user: newAdmin.email },
            { status: 201 }
        )
    } catch (error) {
        console.error("Seeding error:", error)
        return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
    }
}
