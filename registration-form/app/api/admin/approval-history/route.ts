import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Participant from "@/models/Participant"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request) {
    try {
        await dbConnect()
        
        const user = await getCurrentUser()
        
        if (!user || user.role !== "super-admin") {
            return NextResponse.json(
                { error: "Unauthorized - Super admin access required" },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const role = searchParams.get('role') || 'all'
        const status = searchParams.get('status') || 'all'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        // Build query
        let query: any = {}
        
        // Add date range filter if provided
        if (startDate || endDate) {
            query["approvalLogs.timestamp"] = {}
            if (startDate) {
                query["approvalLogs.timestamp"].$gte = new Date(startDate)
            }
            if (endDate) {
                query["approvalLogs.timestamp"].$lte = new Date(endDate + "T23:59:59.999Z")
            }
        }

        // Fetch participants with approval logs
        const participants = await Participant.find(query)
            .populate("approvalLogs.approvedBy", "name email")
            .lean()

        // Flatten approval logs into records
        let records: any[] = []

        participants.forEach((participant: any) => {
            participant.approvalLogs?.forEach((log: any) => {
                // Apply filters
                if (role !== 'all' && log.role !== role) return
                if (status !== 'all' && log.status !== status) return
                if (search) {
                    const searchLower = search.toLowerCase()
                    const participantName = participant.name?.toLowerCase() || ""
                    const participantPhone = participant.mobileNumber?.toLowerCase() || ""
                    const approvedByName = log.approvedBy?.name?.toLowerCase() || ""
                    const approvedByEmail = log.approvedBy?.email?.toLowerCase() || ""
                    
                    if (!participantName.includes(searchLower) && 
                        !participantPhone.includes(searchLower) && 
                        !approvedByName.includes(searchLower) && 
                        !approvedByEmail.includes(searchLower)) {
                        return
                    }
                }

                records.push({
                    participantName: participant.name || "",
                    participantPhone: participant.mobileNumber || "",
                    participantEmail: participant.email || "",
                    approvedBy: log.approvedBy?.name || "",
                    approvedByEmail: log.approvedBy?.email || "",
                    role: log.role,
                    status: log.status,
                    date: log.timestamp,
                    participantId: participant._id
                })
            })
        })

        // Sort by date (newest first)
        records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        // Pagination
        const total = records.length
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedRecords = records.slice(startIndex, endIndex)

        return NextResponse.json({
            records: paginatedRecords,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error("Approval history error:", error)
        return NextResponse.json(
            { error: "Failed to fetch approval history" },
            { status: 500 }
        )
    }
}
