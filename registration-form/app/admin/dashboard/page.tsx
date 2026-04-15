"use client"

import * as React from "react"
import { Download, Users, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface DashboardStats {
    totalRegistrations: number
    totalPeople: number
    totalCheckedIn: number
    totalSecondaryCheckedIn: number
}

interface DashboardRecord {
    type: string
    name: string
    phone: string
    email: string
    checkedIn: boolean
    eventDate: string
    location: string
}

export default function DashboardPage() {
    const [stats, setStats] = React.useState<DashboardStats | null>(null)
    const [records, setRecords] = React.useState<DashboardRecord[]>([])
    const [loading, setLoading] = React.useState(true)
    const [filter, setFilter] = React.useState<"all" | "checked-in" | "not-checked-in">("all")
    const [downloading, setDownloading] = React.useState(false)

    const loadStats = React.useCallback(async () => {
        try {
            const res = await fetch("/api/dashboard/stats")
            const data = await res.json()
            setStats(data)
        } catch (error) {
            console.error("Failed to load stats:", error)
        }
    }, [])

    const loadRecords = React.useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/dashboard/records?filter=${filter}`)
            const data = await res.json()
            setRecords(data)
        } catch (error) {
            console.error("Failed to load records:", error)
        } finally {
            setLoading(false)
        }
    }, [filter])

    React.useEffect(() => {
        loadStats()
    }, [loadStats])

    React.useEffect(() => {
        loadRecords()
    }, [loadRecords, filter])

    const downloadExcel = async () => {
        setDownloading(true)
        try {
            const res = await fetch("/api/dashboard/export")
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "participants.xlsx"
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Failed to download Excel:", error)
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button
                    onClick={downloadExcel}
                    disabled={downloading}
                    className="flex items-center gap-2"
                >
                    {downloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    Export Excel
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="text-sm text-muted-foreground">Total Registrations</div>
                    <div className="text-2xl font-bold">{stats?.totalRegistrations || 0}</div>
                </div>
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="text-sm text-muted-foreground">Total People</div>
                    <div className="text-2xl font-bold">{stats?.totalPeople || 0}</div>
                </div>
                <div className="p-4 rounded-lg border bg-green-50 text-green-900 border-green-100 dark:bg-green-900/20 dark:text-green-100 dark:border-green-900">
                    <div className="text-sm opacity-80">Checked-in People</div>
                    <div className="text-2xl font-bold">{stats?.totalCheckedIn || 0}</div>
                </div>
                <div className="p-4 rounded-lg border bg-green-50 text-green-900 border-green-100 dark:bg-green-900/20 dark:text-green-100 dark:border-green-900">
                    <div className="text-sm opacity-80">Secondary Checked-in</div>
                    <div className="text-2xl font-bold">{stats?.totalSecondaryCheckedIn || 0}</div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <div className="flex items-center justify-between p-4">
                    <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="checked-in">Checked-in</TabsTrigger>
                            <TabsTrigger value="not-checked-in">Not Checked-in</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Checked-in</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((record, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{record.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={record.type === "Primary" ? "default" : "secondary"}>
                                            {record.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{record.phone}</TableCell>
                                    <TableCell>{record.email || "-"}</TableCell>
                                    <TableCell>{record.location || "-"}</TableCell>
                                    <TableCell>
                                        {record.checkedIn ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <span className="text-muted-foreground">○</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
