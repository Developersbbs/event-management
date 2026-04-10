"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from "@/components/ui/table"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"

interface GroupStatsTableProps {
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

export function GroupStatsTable({ data }: GroupStatsTableProps) {
    const total = data.reduce((acc, curr) => ({
        members: acc.members + curr.membersCount,
        adults: acc.adults + curr.adultsCount,
        children: acc.children + curr.childrenCount,
        guests: acc.guests + curr.totalGuest,
        checkedInMembers: acc.checkedInMembers + (curr.checkedInMembers || 0),
        checkedInGuestAdults: acc.checkedInGuestAdults + (curr.checkedInGuestAdults || 0),
        checkedInChildren: acc.checkedInChildren + (curr.checkedInChildren || 0),
        totalCheckedIn: acc.totalCheckedIn + (curr.totalCheckedIn || 0),
    }), { members: 0, adults: 0, children: 0, guests: 0, checkedInMembers: 0, checkedInGuestAdults: 0, checkedInChildren: 0, totalCheckedIn: 0 })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Group Participation Breakdown</CardTitle>
                <CardDescription>Detailed count of members and guests by group.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Group Number</TableHead>
                            <TableHead className="text-center font-bold border-l bg-muted/20">Members (Reg)</TableHead>
                            <TableHead className="text-center bg-muted/20">Adults (Reg)</TableHead>
                            <TableHead className="text-center bg-muted/20">Children (Reg)</TableHead>
                            <TableHead className="text-center border-r bg-muted/20">Total (Reg)</TableHead>

                            <TableHead className="text-center font-bold text-green-700 bg-green-50/50">Members (In)</TableHead>
                            <TableHead className="text-center text-green-700 bg-green-50/50">Adults (In)</TableHead>
                            <TableHead className="text-center text-green-700 bg-green-50/50">Children (In)</TableHead>
                            <TableHead className="text-right font-bold text-green-700 bg-green-50/50">Total (In)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item._id}>
                                <TableCell className="font-medium">Group {item._id}</TableCell>
                                <TableCell className="text-center text-muted-foreground border-l bg-muted/10">{item.membersCount}</TableCell>
                                <TableCell className="text-center text-muted-foreground bg-muted/10">{item.adultsCount}</TableCell>
                                <TableCell className="text-center text-muted-foreground bg-muted/10">{item.childrenCount}</TableCell>
                                <TableCell className="text-center font-medium border-r bg-muted/10">{item.membersCount + item.totalGuest}</TableCell>

                                <TableCell className="text-center text-green-600 bg-green-50/30 font-medium">{item.checkedInMembers || 0}</TableCell>
                                <TableCell className="text-center text-green-600 bg-green-50/30">{item.checkedInGuestAdults || 0}</TableCell>
                                <TableCell className="text-center text-green-600 bg-green-50/30">{item.checkedInChildren || 0}</TableCell>
                                <TableCell className="text-right font-bold text-green-700 bg-green-50/30">{item.totalCheckedIn || 0}</TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    No data available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell className="font-bold">Grand Total</TableCell>
                            <TableCell className="text-center font-bold border-l bg-muted/20">{total.members}</TableCell>
                            <TableCell className="text-center font-bold bg-muted/20">{total.adults}</TableCell>
                            <TableCell className="text-center font-bold bg-muted/20">{total.children}</TableCell>
                            <TableCell className="text-center font-bold border-r bg-muted/20">{total.members + total.guests}</TableCell>

                            <TableCell className="text-center font-bold text-green-700 bg-green-50/50">{total.checkedInMembers}</TableCell>
                            <TableCell className="text-center font-bold text-green-700 bg-green-50/50">{total.checkedInGuestAdults}</TableCell>
                            <TableCell className="text-center font-bold text-green-700 bg-green-50/50">{total.checkedInChildren}</TableCell>
                            <TableCell className="text-right font-bold text-green-700 bg-green-50/50">{total.totalCheckedIn}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    )
}
