"use server"

import dbConnect from "@/lib/db"
import Participant from "@/models/Participant"
import Event from "@/models/Event"
import mongoose from "mongoose"

export async function registerParticipant(data: any) {
    const session = await mongoose.startSession()

    try {
        await dbConnect()

        session.startTransaction()

        const {
            mobileNumber,
            name,
            businessName,
            businessCategory,
            location,
            paymentMethod,
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
        }).session(session)

        if (!activeEvent) {
            throw new Error("No active registration period found.")
        }

        // FIND TICKET
        const selectedTicket = activeEvent.ticketsPrice.find(
            (t: any) => t.name === ticketType
        )

        if (!selectedTicket) {
            throw new Error("Invalid ticket type")
        }

        // CAPACITY CHECK (IMPORTANT)
        const totalPeople = guestCount + 1

        if (activeEvent.registeredCount + totalPeople > activeEvent.maxCapacity) {
            throw new Error("Event is full")
        }

        // PRICE CALCULATION
        let pricePerPerson = selectedTicket.price

        if (isMember) {
            pricePerPerson -= 200 // optional discount
        }

        const totalAmount = totalPeople * pricePerPerson

        // CHECK DUPLICATE
        const existingParticipant = await Participant.findOne({ mobileNumber }).session(session)

        if (existingParticipant && existingParticipant.isRegistered) {
            throw new Error("This mobile number is already registered.")
        }

        // CREATE / UPDATE PARTICIPANT
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

                    // NEW FIELDS
                    eventId: activeEvent._id,
                    guestCount,
                    ticketType,
                    ticketPrice: pricePerPerson,
                    totalAmount,
                    isMember,

                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    createdAt: new Date(),
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true, session }
        )

        // UPDATE EVENT COUNTS
        selectedTicket.soldCount += totalPeople

        await activeEvent.save({ session })

        await Event.findByIdAndUpdate(
            activeEvent._id,
            { $inc: { registeredCount: totalPeople } },
            { session }
        )

        await session.commitTransaction()
        session.endSession()

        return {
            success: true,
            id: participant._id.toString(),
            totalAmount
        }

    } catch (error: any) {
        await session.abortTransaction()
        session.endSession()

        console.error("Error registering participant:", error)

        return {
            success: false,
            error: error.message || "Failed to register"
        }
    }
}
