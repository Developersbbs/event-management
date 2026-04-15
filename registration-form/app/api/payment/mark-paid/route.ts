import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Participant from "@/models/Participant"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
    try {
        await dbConnect()
        const { id } = await request.json()

        if (!id) {
            return NextResponse.json(
                { error: "Participant ID is required" },
                { status: 400 }
            )
        }

        const participant = await Participant.findById(id)

        if (!participant) {
            return NextResponse.json(
                { error: "Participant not found" },
                { status: 404 }
            )
        }

        // Only allow manual payment update for cash payments
        if (participant.paymentMethod !== "cash") {
            return NextResponse.json(
                { error: "Only cash payments can be manually marked as paid" },
                { status: 400 }
            )
        }

        // Update payment status
        participant.paymentStatus = "completed"
        await participant.save()

        revalidatePath("/admin")
        revalidatePath("/admin/dashboard")

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Mark as paid error:", error)
        return NextResponse.json(
            { error: "Failed to mark as paid" },
            { status: 500 }
        )
    }
}
