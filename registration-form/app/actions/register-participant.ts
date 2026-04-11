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
            isMorningFood = false,
            guestCount = 0,
            ticketType,
            isMember = false
        } = data

        // COMPREHENSIVE VALIDATION
        if (!mobileNumber || !name || !ticketType) {
            return {
                success: false,
                error: "Missing required fields: mobile number, name, and ticket type are required"
            }
        }

        // Validate mobile number format
        const phoneRegex = /^\+?[1-9]\d{1,14}$/
        if (!phoneRegex.test(mobileNumber)) {
            return {
                success: false,
                error: "Invalid mobile number format"
            }
        }

        // Validate email format if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                return {
                    success: false,
                    error: "Invalid email format"
                }
            }
        }

        // Validate guest count
        if (guestCount < 0 || !Number.isInteger(guestCount)) {
            return {
                success: false,
                error: "Invalid guest count"
            }
        }

        // Validate payment method
        if (!["cash", "online"].includes(paymentMethod)) {
            return {
                success: false,
                error: "Invalid payment method"
            }
        }

        // Validate food preference
        if (foodPreference) {
            const veg = foodPreference.veg || 0
            const nonVeg = foodPreference.nonVeg || 0
            const totalPeople = guestCount + 1
            
            if (veg < 0 || nonVeg < 0) {
                return {
                    success: false,
                    error: "Food preference counts cannot be negative"
                }
            }

            if (veg + nonVeg > totalPeople) {
                return {
                    success: false,
                    error: "Total food preference count exceeds total people"
                }
            }
        }

        const now = new Date()

        // FIND ACTIVE EVENT
        const activeEvent = await Event.findOne({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        })

        if (!activeEvent) {
            return {
                success: false,
                error: "No active event found. Please contact administrator."
            }
        }

        // FIND TICKET
        const selectedTicket = activeEvent.ticketsPrice.find(
            (t: any) => t.name === ticketType
        )

        if (!selectedTicket) {
            return {
                success: false,
                error: `Invalid ticket type: ${ticketType}. Please select a valid ticket.`
            }
        }

        const totalPeople = guestCount + 1

        // Check event capacity
        if (activeEvent.registeredCount + totalPeople > activeEvent.maxCapacity) {
            return {
                success: false,
                error: "Event is at full capacity. No more registrations available."
            }
        }

        let pricePerPerson = selectedTicket.price

        // Validate price
        if (pricePerPerson < 0) {
            return {
                success: false,
                error: "Invalid ticket price"
            }
        }

        // Ensure foodPreference is properly structured
        const normalizedFoodPreference = {
            veg: Math.max(0, foodPreference?.veg || 0),
            nonVeg: Math.max(0, foodPreference?.nonVeg || 0)
        }

        // Apply member discount
        if (isMember) {
            pricePerPerson = Math.max(0, pricePerPerson - 200)
        }

        const totalAmount = totalPeople * pricePerPerson

        // PAYMENT LOGIC
        let paymentStatus = "pending"
        let approvalStatus = "pending"

        if (paymentMethod === "online") {
            paymentStatus = "completed"
            approvalStatus = "approved"
        }

        // Create participant with validated data
        const participant = await Participant.create({
            mobileNumber: mobileNumber.trim(),
            name: name.trim(),
            email: email?.trim(),
            businessName: businessName?.trim(),
            businessCategory: businessCategory?.trim(),
            location: location?.trim(),
            paymentMethod,
            paymentStatus,
            approvalStatus,
            foodPreference: normalizedFoodPreference,
            isMorningFood,
            isRegistered: true,
            eventId: activeEvent._id,
            eventDate: activeEvent.startDate,
            guestCount,
            ticketType,
            ticketPrice: pricePerPerson,
            totalAmount,
            isMember
        })

        // Update event counts atomically
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

        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return {
                success: false,
                error: "This mobile number is already registered for this event"
            }
        }

        if (error.name === "ValidationError") {
            return {
                success: false,
                error: "Validation failed: " + Object.values(error.errors).map((e: any) => e.message).join(", ")
            }
        }

        return {
            success: false,
            error: error.message || "Failed to register. Please try again later."
        }
    }
}
