"use server"

import dbConnect from "@/lib/db"
import Participant from "@/models/Participant"

export async function checkRegistration(mobileNumber: string) {
    try {
        await dbConnect()

        // Find if a participant exists with this mobile number
        // We only care if they are fully "registered" or if we want to block any partial attempts too.
        // Based on requirements: "check weather the number is already register or not"
        // Assuming we check for ANY record, or specifically `isRegistered: true`
        // For now, let's check if a record exists and if `isRegistered` flag is true (if we use that flag).
        // Or just existence if we treat any entry as "started/registered".
        // Let's stick to the model definition: `isRegistered` field.

        const participant = await Participant.findOne({ mobileNumber })

        if (participant && participant.isRegistered) {
            return {
                exists: true,
                participant: JSON.parse(JSON.stringify(participant)), // Ensure plain object for client serialization
                message: "This mobile number is already registered."
            }
        }

        return { exists: false }

    } catch (error) {
        console.error("Error checking registration:", error)
        return {
            exists: false,
            error: "Failed to verify registration status."
        }
    }
}
