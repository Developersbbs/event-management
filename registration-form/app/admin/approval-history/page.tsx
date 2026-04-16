import { Suspense } from "react"
import { ApprovalHistoryTable } from "@/components/approval-history-table"

export default function ApprovalHistoryPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between space-y-2 py-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Approval History</h2>
                    <p className="text-muted-foreground">
                        Track which admins and super admins approved or rejected registrations.
                    </p>
                </div>
            </div>
            <Suspense fallback={<div>Loading approval history...</div>}>
                <ApprovalHistoryTable />
            </Suspense>
        </div>
    )
}
