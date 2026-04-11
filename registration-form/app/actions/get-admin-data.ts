"use server"

import dbConnect from "@/lib/db"
import Participant from "@/models/Participant"
import { startOfDay, endOfDay } from "date-fns"

export async function getAdminData() {
    await dbConnect()

    try {
        const participants = await Participant.find({}).sort({ createdAt: -1 }).lean()

        const stats = {
            totalRegistrations: participants.length,
            totalGuests: 0,
            totalAmount: 0,
            pendingApprovals: 0,
            approvedRegistrations: 0,
            rejectedRegistrations: 0,
            cashPayments: 0,
            onlinePayments: 0,
            vegCount: 0,
            nonVegCount: 0,
            morningFoodCount: 0,
        }

        participants.forEach((p: any) => {
            // Handle new schema fields for participants
            const guestCount = p.guestCount || 0
            const totalAmount = p.totalAmount || 0
            const veg = p.foodPreference?.veg || 0
            const nonVeg = p.foodPreference?.nonVeg || 0
            const paymentMethod = p.paymentMethod || "cash"
            const approvalStatus = p.approvalStatus || "pending"

            stats.totalGuests += guestCount
            stats.totalAmount += totalAmount
            stats.vegCount += veg
            stats.nonVegCount += nonVeg
            
            if (paymentMethod === "cash") {
                stats.cashPayments += 1
            } else {
                stats.onlinePayments += 1
            }

            if (approvalStatus === "pending") {
                stats.pendingApprovals += 1
            } else if (approvalStatus === "approved") {
                stats.approvedRegistrations += 1
            } else if (approvalStatus === "rejected") {
                stats.rejectedRegistrations += 1
            }

            if (p.isMorningFood) {
                stats.morningFoodCount += (guestCount + 1) // +1 for registrant
            }
        })

        // Serializing MongoDB IDs and dates for client components
        const safeParticipants = participants.map((p: any) => ({
            ...p,
            _id: p._id.toString(),
            createdAt: p.createdAt?.toISOString(),
            updatedAt: p.updatedAt?.toISOString(),
            checkIn: p.checkIn ? {
                ...p.checkIn,
                checkInTime: p.checkIn.timestamp?.toISOString()
            } : undefined
        }))

        return { success: true, participants: safeParticipants, stats }
    } catch (error) {
        console.error("Error fetching admin data:", error)
        return { success: false, error: "Failed to fetch data" }
    }
}

export async function getGroupStats(from?: string, to?: string) {
    await dbConnect()

    try {
        const matchStage: any = {}

        if (from) {
            const startDate = startOfDay(new Date(from))
            const endDate = to ? endOfDay(new Date(to)) : endOfDay(new Date(from))
            matchStage.createdAt = {
                $gte: startDate,
                $lte: endDate
            }
        }

        const pipeline: any[] = []
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage })
        }

        pipeline.push(
            {
                $group: {
                    _id: "$groupNumber",
                    membersCount: { $sum: 1 },
                    rawAdultsCount: { $sum: "$ageGroups.adults" },
                    childrenCount: { $sum: "$ageGroups.children" },
                    // Check-in Metrics
                    checkedInMembers: {
                        $sum: {
                            $cond: [
                                { $and: ["$checkIn.isCheckedIn", "$checkIn.memberPresent"] },
                                1,
                                0
                            ]
                        }
                    },
                    checkedInGuestAdults: {
                        $sum: {
                            $cond: [
                                "$checkIn.isCheckedIn",
                                {
                                    $max: [
                                        0,
                                        {
                                            $subtract: [
                                                { $ifNull: ["$checkIn.actualAdults", 0] },
                                                { $cond: ["$checkIn.memberPresent", 1, 0] }
                                            ]
                                        }
                                    ]
                                },
                                0
                            ]
                        }
                    },
                    checkedInChildren: {
                        $sum: {
                            $cond: [
                                "$checkIn.isCheckedIn",
                                { $ifNull: ["$checkIn.actualChildren", 0] },
                                0
                            ]
                        }
                    }
                }
            },
            {
                $addFields: {
                    adultsCount: { $subtract: ["$rawAdultsCount", "$membersCount"] }, // Registered Guests (Adults)
                    totalGuest: { $add: [{ $subtract: ["$rawAdultsCount", "$membersCount"] }, "$childrenCount"] },
                    checkedInParticipants: { $add: ["$checkedInGuestAdults", "$checkedInChildren"] }, // Helper
                    totalCheckedIn: { $add: ["$checkedInMembers", "$checkedInGuestAdults", "$checkedInChildren"] }
                }
            },
            { $sort: { _id: 1 } }
        )

        const stats = await Participant.aggregate(pipeline)

        // Sorting numerically if possible, otherwise string sort from DB is used.
        // Javascript sort to handle "1", "2", "10" correctly
        const sortedStats = stats.sort((a, b) => {
            const numA = parseInt(a._id) || 0
            const numB = parseInt(b._id) || 0
            // If both are numbers, compare numerically
            // If one is string, it goes to end or compare strings
            if (!isNaN(parseInt(a._id)) && !isNaN(parseInt(b._id))) {
                return numA - numB
            }
            return a._id.localeCompare(b._id)
        })

        return { success: true, stats: sortedStats }
    } catch (error) {
        console.error("Error fetching group stats:", error)
        return { success: false, error: "Failed to fetch group stats" }
    }
}
