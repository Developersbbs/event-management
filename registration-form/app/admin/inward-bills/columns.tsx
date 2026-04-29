"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export type InwardBillData = {
  _id: string
  name: string
  mobileNumber: string
  businessName?: string
  gstNumber?: string
  totalAmount: number
  paymentMethod: string
  paymentId: string
  createdAt: string
}

export const columns: ColumnDef<InwardBillData>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile",
  },
  {
    accessorKey: "businessName",
    header: "Business Name",
    cell: ({ row }) => row.getValue("businessName") || "N/A",
  },
  {
    accessorKey: "gstNumber",
    header: "GST Number",
    cell: ({ row }) => {
      const gst = row.getValue("gstNumber") as string
      return gst ? <Badge variant="outline">{gst}</Badge> : "N/A"
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Amount Paid",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount || 0)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => {
      const method = row.getValue("paymentMethod") as string
      return <Badge variant={method === "online" ? "default" : "secondary"}>{method?.toUpperCase() || "N/A"}</Badge>
    },
  },
  {
    id: "actions",
    header: "Invoice",
    cell: ({ row }) => {
      const participant = row.original

      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            window.open(`/api/admin/download-invoice?participantId=${participant._id}`, "_blank")
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      )
    },
  },
]
