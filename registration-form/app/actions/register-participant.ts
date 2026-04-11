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
            email,
            businessName,
            businessCategory,
            location,
            paymentMethod = "cash",
            foodPreference,
            guestCount = 0,
            ticketType,
            isMember = false
        } = data

        // BASIC VALIDATION
        if (!mobileNumber || !name || !ticketType) {
            throw new Error("Missing required fields")
        }

        const now = new Date()

        // FIND ACTIVE EVENT
        const activeEvent = await Event.findOne({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        })

        if (!activeEvent) {
            throw new Error("No active event")
        }

        // FIND TICKET
        const selectedTicket = activeEvent.ticketsPrice.find(
            (t: any) => t.name === ticketType
        )

        if (!selectedTicket) {
            throw new Error("Invalid ticket")
        }

        const totalPeople = guestCount + 1

        if (activeEvent.registeredCount + totalPeople > activeEvent.maxCapacity) {
            throw new Error("Event full")
        }

        let pricePerPerson = selectedTicket.price

        if (isMember) {
            pricePerPerson -= 200
        }

        const totalAmount = totalPeople * pricePerPerson

        // PAYMENT LOGIC
        let paymentStatus = "pending"
        let approvalStatus = "pending"

        if (paymentMethod === "online") {
            paymentStatus = "completed"
            approvalStatus = "approved"
        }

        const participant = await Participant.create({
            mobileNumber,
            name,
            email,
            businessName,
            businessCategory,
            location,
            paymentMethod,
            paymentStatus,
            approvalStatus,
            foodPreference,
            isRegistered: true,
            eventId: activeEvent._id,
            guestCount,
            ticketType,
            ticketPrice: pricePerPerson,
            totalAmount,
            isMember
        })

        // update counts
        selectedTicket.soldCount += totalPeople
        await activeEvent.save()

        await Event.findByIdAndUpdate(
            activeEvent._id,
            { $inc: { registeredCount: totalPeople } }
        )

        return {
            success: true,
            id: participant._id.toString(),
            totalAmount
        }

    } catch (error: any) {
        console.error("Error registering participant:", error)

        return {
            success: false,
            error: error.message || "Failed to register"
        }
    }
}
