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

        let totalRevenue = 0

        participants.forEach((p: any) => {
            totalPeople += 1 + (p.secondaryMembers?.length || 0)
            totalRevenue += p.totalAmount || 0
            if (p.checkIn?.isCheckedIn) {
                totalCheckedIn += (p.checkIn?.memberPresent ? 1 : 0) + (p.secondaryMembers?.filter((m: any) => m.isCheckedIn).length || 0)
            }
            totalSecondaryCheckedIn += p.secondaryMembers?.filter((m: any) => m.isCheckedIn).length || 0
        })

        return NextResponse.json({
            totalRegistrations,
            totalPeople,
            totalCheckedIn,
            totalSecondaryCheckedIn,
            totalRevenue
        })
    } catch (error) {
        console.error("Dashboard stats error:", error)
        return NextResponse.json(
            { error: "Failed to fetch dashboard stats" },
            { status: 500 }
        )
    }
}
