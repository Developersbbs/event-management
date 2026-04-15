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
        let primaryMembers = 0
        let secondaryMembers = 0

        participants.forEach((p: any) => {
            const secondaryCount = p.secondaryMembers?.length || 0
            totalPeople += 1 + secondaryCount
            primaryMembers += 1
            secondaryMembers += secondaryCount
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
            primaryMembers,
            secondaryMembers
        })
    } catch (error) {
        console.error("Dashboard stats error:", error)
        return NextResponse.json(
            { error: "Failed to fetch dashboard stats" },
            { status: 500 }
        )
    }
}
