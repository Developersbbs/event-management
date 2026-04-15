import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Participant from "@/models/Participant"

export async function GET() {
    try {
        await dbConnect()
        const participants = await Participant.find({ isRegistered: true, approvalStatus: 'approved' }).lean()

        let totalRegistrations = participants.length
        let totalPeople = 0
        let totalCheckedIn = 0
        let totalSecondaryCheckedIn = 0

        participants.forEach((p: any) => {
            const secondaryCount = p.secondaryMembers?.length || 0
            totalPeople += 1 + secondaryCount

            // primary
            if (p.checkIn?.isCheckedIn) {
                totalCheckedIn += 1
            }

            // secondary
            p.secondaryMembers?.forEach((m: any) => {
                if (m.isCheckedIn) {
                    totalCheckedIn += 1
                    totalSecondaryCheckedIn += 1
                }
            })
        })

        return NextResponse.json({
            totalRegistrations,
            totalPeople,
            totalCheckedIn,
            totalSecondaryCheckedIn
        })
    } catch (error) {
        console.error("Dashboard stats error:", error)
        return NextResponse.json(
            { error: "Failed to fetch dashboard stats" },
            { status: 500 }
        )
    }
}
