"use client"

import * as React from "react"
import { CheckInTable } from "./check-in-table"

interface CheckInViewProps {
    userRole?: string
}

export function CheckInView({ userRole }: CheckInViewProps) {
    return (
        <div className="max-w-6xl w-full mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">Event Check-in</h1>
            <CheckInTable />
        </div>
    )
}
