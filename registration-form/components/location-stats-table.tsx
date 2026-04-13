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

interface LocationStatsTableProps {
    data: Array<{
        _id: string
        membersCount: number
        totalGuest: number
        checkedInMembers: number
        checkedInParticipants: number
        totalCheckedIn: number
    }>
}

export function LocationStatsTable({ data }: LocationStatsTableProps) {
    const total = data.reduce((acc, curr) => ({
        members: acc.members + curr.membersCount,
        guests: acc.guests + curr.totalGuest,
        checkedInMembers: acc.checkedInMembers + (curr.checkedInMembers || 0),
        checkedInGuests: acc.checkedInGuests + (curr.checkedInParticipants || 0),
        totalCheckedIn: acc.totalCheckedIn + (curr.totalCheckedIn || 0),
    }), { members: 0, guests: 0, checkedInMembers: 0, checkedInGuests: 0, totalCheckedIn: 0 })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Location Participation Breakdown</CardTitle>
                <CardDescription>Detailed count of members and guests by location.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-center font-bold border-l bg-muted/20">Members (Reg)</TableHead>
                            <TableHead className="text-center bg-muted/20">Guests (Reg)</TableHead>
                            <TableHead className="text-center border-r bg-muted/20">Total (Reg)</TableHead>

                            <TableHead className="text-center font-bold text-green-700 bg-green-50/50">Members (In)</TableHead>
                            <TableHead className="text-center text-green-700 bg-green-50/50">Guests (In)</TableHead>
                            <TableHead className="text-right font-bold text-green-700 bg-green-50/50">Total (In)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item._id}>
                                <TableCell className="font-medium">{item._id || "Unknown"}</TableCell>
                                <TableCell className="text-center text-muted-foreground border-l bg-muted/10">{item.membersCount}</TableCell>
                                <TableCell className="text-center text-muted-foreground bg-muted/10">{item.totalGuest}</TableCell>
                                <TableCell className="text-center font-medium border-r bg-muted/10">{item.membersCount + item.totalGuest}</TableCell>

                                <TableCell className="text-center text-green-600 bg-green-50/30 font-medium">{item.checkedInMembers || 0}</TableCell>
                                <TableCell className="text-center text-green-600 bg-green-50/30">{item.checkedInParticipants || 0}</TableCell>
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
                            <TableCell className="text-center font-bold bg-muted/20">{total.guests}</TableCell>
                            <TableCell className="text-center font-bold border-r bg-muted/20">{total.members + total.guests}</TableCell>

                            <TableCell className="text-center font-bold text-green-700 bg-green-50/50">{total.checkedInMembers}</TableCell>
                            <TableCell className="text-center font-bold text-green-700 bg-green-50/50">{total.checkedInGuests}</TableCell>
                            <TableCell className="text-right font-bold text-green-700 bg-green-50/50">{total.totalCheckedIn}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    )
}
