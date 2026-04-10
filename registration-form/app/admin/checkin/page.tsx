
import { getCurrentUser } from "@/lib/auth"
import { CheckInView } from "@/components/check-in-view"

export default async function CheckInPage() {
    const user = await getCurrentUser()

    return <CheckInView userRole={user?.role} />
}
