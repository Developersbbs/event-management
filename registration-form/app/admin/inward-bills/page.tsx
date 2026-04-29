import { getCurrentUser } from "@/lib/auth"
import { InwardBillsTable } from "./inward-bills-table"
import { columns } from "./columns"
import mongoose from "mongoose"
import Participant from "@/models/Participant"

async function getInwardBillsData() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI!)
  }
  
  // Get all participants who have completed payments
  const participants = await Participant.find({ paymentStatus: "completed" }).sort({ createdAt: -1 }).lean()
  
  return JSON.parse(JSON.stringify(participants))
}

export default async function InwardBillsPage() {
  const user = await getCurrentUser()
  
  if (!user || (user.role !== "admin" && user.role !== "super-admin")) {
    return <div>Unauthorized</div>
  }

  const participants = await getInwardBillsData()

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex justify-between items-center px-4 lg:px-6">
            <h2 className="text-2xl font-bold">Inward Bills (Invoices)</h2>
          </div>
          
          <div className="px-4 lg:px-6">
            <p className="text-muted-foreground mb-6">
              View and download invoices for all participants who have completed their payments.
            </p>
            <InwardBillsTable columns={columns} data={participants || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
