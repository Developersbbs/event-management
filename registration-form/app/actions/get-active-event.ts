"use server"

import dbConnect from "@/lib/db"
import Event from "@/models/Event"

export async function getActiveEvent() {
    try {
        await dbConnect()

        const now = new Date()

        const activeEvent = await Event.findOne({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).lean()

        if (!activeEvent) {
            return {
                success: false,
                error: "No active event found"
            }
        }

        // Serialize the event data for client consumption
        return {
            success: true,
            event: {
                ...activeEvent,
                _id: activeEvent._id.toString(),
                startDate: activeEvent.startDate.toISOString(),
                endDate: activeEvent.endDate.toISOString(),
                createdAt: activeEvent.createdAt?.toISOString(),
                updatedAt: activeEvent.updatedAt?.toISOString(),
            }
        }
    } catch (error: any) {
        console.error("Error fetching active event:", error)
        return {
            success: false,
            error: error.message || "Failed to fetch active event"
        }
    }
}
