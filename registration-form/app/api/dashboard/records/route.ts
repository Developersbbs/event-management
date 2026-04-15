import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Participant from "@/models/Participant"

export async function GET(request: Request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(request.url)
        const filter = searchParams.get('filter') || 'all'

        let query: any = { isRegistered: true, approvalStatus: 'approved' }
        
        if (filter === 'checked-in') {
            query["checkIn.isCheckedIn"] = true
        } else if (filter === 'not-checked-in') {
            query["checkIn.isCheckedIn"] = false
        }

        const participants = await Participant.find(query).lean()

        let records: any[] = []

        participants.forEach((p: any) => {
            // primary
            records.push({
                type: "Primary",
                name: p.name,
                phone: p.mobileNumber,
                email: p.email || "",
                checkedIn: p.checkIn?.isCheckedIn || false,
                eventDate: p.eventDate || "",
                location: p.location || ""
            })

            // secondary
            p.secondaryMembers?.forEach((m: any) => {
                records.push({
                    type: "Secondary",
                    name: m.name,
                    phone: m.mobileNumber,
                    email: m.email || "",
                    checkedIn: m.isCheckedIn || false,
                    eventDate: p.eventDate || "",
                    location: p.location || ""
                })
            })
        })

        return NextResponse.json(records)
    } catch (error) {
        console.error("Dashboard records error:", error)
        return NextResponse.json(
            { error: "Failed to fetch dashboard records" },
            { status: 500 }
        )
    }
}
