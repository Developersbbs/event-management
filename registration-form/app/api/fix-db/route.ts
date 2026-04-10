import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function GET() {
    try {
        await dbConnect()

        // Attempt to drop the username index
        try {
            await User.collection.dropIndex("username_1")
            return NextResponse.json({ message: "Dropped username_1 index successfully" })
        } catch (e: any) {
            if (e.code === 27) {
                return NextResponse.json({ message: "Index username_1 does not exist" })
            }
            return NextResponse.json({ error: e.message }, { status: 500 })
        }

    } catch (error) {
        return NextResponse.json({ error: "Failed to connect to DB" }, { status: 500 })
    }
}
