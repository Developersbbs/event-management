"use server"

import dbConnect from "@/lib/db"
import Participant from "@/models/Participant"

export async function registerParticipant(data: any) {
    try {
        await dbConnect()

        const {
            mobileNumber,
            name,
            groupNumber,
            ageGroups,
            foodPreference,
            isMorningFood,
        } = data

        // Validate essential data
        if (!mobileNumber || !name || !groupNumber) {
            return { success: false, error: "Missing required fields" }
        }

        // Upsert the participant
        // We match by mobileNumber.
        // We set isRegistered to true.
        const participant = await Participant.findOneAndUpdate(
            { mobileNumber },
            {
                $set: {
                    name,
                    groupNumber,
                    ageGroups,
                    foodPreference,
                    isMorningFood,
                    isRegistered: true,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    createdAt: new Date(),
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
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
