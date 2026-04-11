import { EventsTable } from "@/components/events-table"
import { getCurrentUser } from "@/lib/auth"

export default async function EventsPage() {
  const user = await getCurrentUser()

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex justify-between items-center px-4 lg:px-6">
            <div>
              <h2 className="text-2xl font-bold">Events</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage event schedules and registration periods
              </p>
            </div>
          </div>
          <div className="px-4 lg:px-6">
            <EventsTable userRole={user?.role as string} />
          </div>
        </div>
      </div>
    </div>
  )
}
