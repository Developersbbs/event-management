import { getGroupStats } from "@/app/actions/get-admin-data"
import { GroupStatsTable } from "@/components/group-stats-table"
import { StatsDateFilter } from "@/components/stats-date-filter"
import { GroupStatsExport } from "@/components/group-stats-export"

export const dynamic = 'force-dynamic'

export default async function GroupsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { from: rawFrom, to: rawTo } = await searchParams
    const from = typeof rawFrom === 'string' ? rawFrom : undefined
    const to = typeof rawTo === 'string' ? rawTo : undefined

    const { stats, success } = await getGroupStats(from, to)

    if (!success || !stats) {
        return <div>Failed to load stats.</div>
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between space-y-2 py-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Group Statistics</h2>
                    <p className="text-muted-foreground">
                        Overview of participation by group.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <StatsDateFilter />
                    <GroupStatsExport data={stats} />
                </div>
            </div>

            <GroupStatsTable data={stats} />
        </div>
    )
}
