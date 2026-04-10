"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Soup, Salad, Coffee } from "lucide-react"

// Types matching what getAdminData returns
export type Participant = {
    _id: string
    mobileNumber: string
    name: string
    groupNumber: string
    ageGroups: {
        adults: number
        children: number
    }
    foodPreference: {
        veg: number
        nonVeg: number
    }
    isMorningFood: boolean
    createdAt: string
    updatedAt: string
    checkIn?: {
        isCheckedIn: boolean
        memberPresent: boolean
        actualAdults: number
        actualChildren: number
        checkInTime: string
    }
}

export const columns: ColumnDef<Participant>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="font-medium ml-4">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "mobileNumber",
        header: "Mobile",
    },
    {
        accessorKey: "groupNumber",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Group
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-center">{row.getValue("groupNumber")}</div>,
    },
    {
        id: "checkInStatus",
        accessorFn: (row) => row.checkIn?.isCheckedIn,
        header: "Status",
        cell: ({ row }) => {
            const isCheckedIn = row.original.checkIn?.isCheckedIn
            return isCheckedIn ?
                <Badge className="bg-green-600 hover:bg-green-700">In</Badge> :
                <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
        }
    },
    {
        accessorKey: "ageGroups",
        header: "Registered",
        cell: ({ row }) => {
            const { adults, children } = row.original.ageGroups
            const guestAdults = adults > 0 ? adults - 1 : 0
            return (
                <div className="flex flex-col text-sm">
                    <span>Adults: {guestAdults}</span>
                    {children > 0 && <span className="text-muted-foreground">Kids: {children}</span>}
                </div>
            )
        },
    },
    {
        id: "checkInCounts",
        header: "Checked In",
        cell: ({ row }) => {
            if (!row.original.checkIn?.isCheckedIn) return <span className="text-muted-foreground text-center block">-</span>

            const { actualAdults = 0, actualChildren = 0, memberPresent } = row.original.checkIn

            // Calculate guest adults (total adults - 1 if member is present)
            const guestAdults = Math.max(0, actualAdults - (memberPresent ? 1 : 0))

            return (
                <div className="flex flex-col gap-1 text-sm">
                    {memberPresent && (
                        <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                                Member Present
                            </Badge>
                        </div>
                    )}
                    <div className="flex flex-col text-xs text-muted-foreground">
                        {(guestAdults > 0 || actualChildren > 0) ? (
                            <>
                                {guestAdults > 0 && <span className="text-foreground font-medium">{guestAdults} Guest Adults</span>}
                                {actualChildren > 0 && <span className="text-foreground font-medium">{actualChildren} Children</span>}
                            </>
                        ) : (
                            <span>No Guests</span>
                        )}
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "foodPreference",
        header: "Food",
        cell: ({ row }) => {
            const { veg, nonVeg } = row.original.foodPreference
            return (
                <div className="flex gap-2">
                    {nonVeg > 0 && <Badge variant="destructive" className="flex gap-1"><Soup className="w-3 h-3" /> {nonVeg}</Badge>}
                    {veg > 0 && <Badge variant="secondary" className="flex gap-1 text-green-700 bg-green-100"><Salad className="w-3 h-3" /> {veg}</Badge>}
                </div>
            )
        },
    },
    {
        accessorKey: "isMorningFood",
        header: "Morning Food",
        cell: ({ row }) => {
            return row.original.isMorningFood ?
                <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50"><Coffee className="w-3 h-3 mr-1" /> Yes</Badge> :
                <span className="text-muted-foreground text-sm">-</span>
        },
    },
    {
        accessorKey: "createdAt",
        header: "Registered At",
        cell: ({ row }) => {
            return new Date(row.getValue("createdAt")).toLocaleDateString()
        },
    },
]
