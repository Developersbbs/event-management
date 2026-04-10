import { CreateUserDialog } from "@/components/create-user-dialog"
import { UsersTable } from "@/components/users-table"
import { getUsers } from "@/app/actions/user-actions"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SmtpSettingsDialog } from "@/components/smtp-settings-dialog"

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== 'super-admin') {
        redirect('/admin')
    }

    const users = await getUsers()

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between space-y-2 py-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">
                        Manage admin users and their roles.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <SmtpSettingsDialog />
                    <CreateUserDialog />
                </div>
            </div>
            <UsersTable users={users} />
        </div>
    )
}
