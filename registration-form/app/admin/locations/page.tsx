import { getLocationStats } from "@/app/actions/get-admin-data"
import { LocationStatsTable } from "@/components/location-stats-table"
import { StatsDateFilter } from "@/components/stats-date-filter"
import { LocationStatsExport } from "@/components/location-stats-export"

export const dynamic = 'force-dynamic'

export default async function LocationsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { from: rawFrom, to: rawTo } = await searchParams
    const from = typeof rawFrom === 'string' ? rawFrom : undefined
    const to = typeof rawTo === 'string' ? rawTo : undefined

    const { stats, success } = await getLocationStats(from, to)

    if (!success || !stats) {
        return <div>Failed to load stats.</div>
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between space-y-2 py-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Location Statistics</h2>
                    <p className="text-muted-foreground">
                        Overview of participation by location.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <StatsDateFilter />
                    <LocationStatsExport data={stats} />
                </div>
            </div>

            <LocationStatsTable data={stats} />
        </div>
    )
}
