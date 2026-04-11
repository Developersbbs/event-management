"use server"

import dbConnect from "@/lib/db"
import Participant from "@/models/Participant"
import Event from "@/models/Event"

export async function registerParticipant(data: any) {
    try {
        await dbConnect()

        const {
            mobileNumber,
            name,
            businessName,
            businessCategory,
            location,
            paymentMethod,
            foodPreference,
        } = data

        // Validate essential data
        if (!mobileNumber || !name) {
            return { success: false, error: "Missing required fields" }
        }

        // Check if there's an active event
        const now = new Date()
        const activeEvent = await Event.findOne({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        })

        if (!activeEvent) {
            return { success: false, error: "No active registration period found." }
        }

        // Check if event is at full capacity
        if (activeEvent.registeredCount >= activeEvent.maxCapacity) {
            return { success: false, error: "Registration is closed due to maximum capacity." }
        }

        // Check if participant is already registered
        const existingParticipant = await Participant.findOne({ mobileNumber })
        if (existingParticipant && existingParticipant.isRegistered) {
            return { success: false, error: "This mobile number is already registered." }
        }

        // Create or update participant
        const participant = await Participant.findOneAndUpdate(
            { mobileNumber },
            {
                $set: {
                    name,
                    businessName,
                    businessCategory,
                    location,
                    paymentMethod,
                    paymentStatus: "pending",
                    foodPreference,
                    isRegistered: true,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    createdAt: new Date(),
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        // Increment the registered count for the event
        await Event.findByIdAndUpdate(
            activeEvent._id,
            { $inc: { registeredCount: 1 } }
        )

        return { success: true, id: participant._id.toString() }
    } catch (error: any) {
        console.error("Error registering participant:", error)
        if (error.code === 11000) {
            return { success: false, error: "This mobile number is already registered." }
        }
        return { success: false, error: "Failed to register. Please try again." }
    }
}
