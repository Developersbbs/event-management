import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Participant from "@/models/Participant"

export async function POST() {
    try {
        await dbConnect()
        
        const participants = await Participant.find()
        
        let updatedCount = 0
        
        for (const p of participants) {
            const totalMembers = 1 + (p.secondaryMembers?.length || 0)
            const ticketPrice = p.ticketPrice || 0
            
            // Recalculate memberCount and totalAmount
            p.memberCount = totalMembers - 1 // memberCount is just secondary members
            p.totalAmount = totalMembers * ticketPrice
            
            await p.save()
            updatedCount++
        }
        
        return NextResponse.json({ 
            success: true, 
            message: `Fixed ${updatedCount} participants`,
            updatedCount 
        })
    } catch (error) {
        console.error("Data fix error:", error)
        return NextResponse.json(
            { error: "Failed to fix data" },
            { status: 500 }
        )
    }
}
