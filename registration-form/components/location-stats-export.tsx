"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface LocationStatsExportProps {
    data: Array<{
        _id: string
        membersCount: number
        adultsCount: number
        childrenCount: number
        totalGuest: number
        checkedInMembers: number
        checkedInGuestAdults: number
        checkedInChildren: number
        totalCheckedIn: number
    }>
}

export function LocationStatsExport({ data }: LocationStatsExportProps) {
    const handleExport = () => {
        // Define headers
        const headers = [
            "Location",
            "Members (Reg)",
            "Adults (Reg)",
            "Children (Reg)",
            "Total (Reg)",
            "Members (In)",
            "Adults (In)",
            "Children (In)",
            "Total (In)"
        ]

        // Map data to CSV rows
        const rows = data.map(item => [
            item._id || "Unknown",
            item.membersCount,
            item.adultsCount,
            item.childrenCount,
            item.membersCount + item.totalGuest,
            item.checkedInMembers || 0,
            item.checkedInGuestAdults || 0,
            item.checkedInChildren || 0,
            item.totalCheckedIn || 0
        ])

        // Combine headers and rows
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n")

        // Create blob and download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `location_stats_${new Date().toISOString().split('T')[0]}.csv`)

        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
            </span>
        </Button>
    )
}
