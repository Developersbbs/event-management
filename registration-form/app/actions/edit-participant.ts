"use server"

import dbConnect from "@/lib/db"
import Participant from "@/models/Participant"
import { revalidatePath } from "next/cache"
import { IParticipant } from "@/lib/types"

export async function updateParticipant(id: string, data: Partial<IParticipant>) {
    try {
        await dbConnect()

        const {
            mobileNumber,
            name,
            location,
            guestCount,
            ageGroups,
            foodPreference,
            isMorningFood,
        } = data

        // Check if participant exists
        const existingParticipant = await Participant.findById(id)
        if (!existingParticipant) {
            return { success: false, error: "Participant not found" }
        }

        // Check if mobile number is being changed and if it conflicts
        if (mobileNumber && mobileNumber !== existingParticipant.mobileNumber) {
            const conflict = await Participant.findOne({ mobileNumber, _id: { $ne: id } })
            if (conflict) {
                return { success: false, error: "Mobile number already registered to another participant" }
            }
        }

        // Update fields
        if (mobileNumber) existingParticipant.mobileNumber = mobileNumber
        if (name) existingParticipant.name = name
        if (location) existingParticipant.location = location
        
        if (guestCount !== undefined) {
            existingParticipant.guestCount = guestCount
            existingParticipant.ageGroups = { adults: guestCount + 1, children: 0 }
        } else if (ageGroups) {
            existingParticipant.ageGroups = ageGroups
            existingParticipant.guestCount = Math.max(0, (ageGroups.adults || 1) + (ageGroups.children || 0) - 1)
        }

        if (foodPreference) existingParticipant.foodPreference = foodPreference
        if (isMorningFood !== undefined) existingParticipant.isMorningFood = isMorningFood
        existingParticipant.updatedAt = new Date()

        await existingParticipant.save()

        revalidatePath("/admin")
        revalidatePath("/admin/locations")

        return { success: true }
    } catch (error: unknown) {
        console.error("Error updating participant:", error)
        return { success: false, error: "Failed to update participant" }
    }
}
