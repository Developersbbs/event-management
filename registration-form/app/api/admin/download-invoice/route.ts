import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import Participant from "@/models/Participant"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "admin" && user.role !== "super-admin")) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const participantId = searchParams.get("participantId")

    if (!participantId) {
      return new NextResponse("Missing participantId", { status: 400 })
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!)
    }

    const participant = await Participant.findById(participantId)

    if (!participant) {
      return new NextResponse("Participant not found", { status: 404 })
    }

    // Build the invoice data using existing properties from the DB
    const invoiceData = {
      name: participant.name || "",
      email: participant.email || "",
      mobileNumber: participant.mobileNumber || "",
      businessName: participant.businessName || "",
      gstNumber: participant.gstNumber || "",
      ticketType: participant.ticketType || "Standard",
      baseAmount: participant.baseAmount || 0,
      taxAmount: participant.taxAmount || 0,
      totalAmount: participant.totalAmount || 0,
      taxRate: participant.taxRate || 0,
      paymentId: participant.paymentId || `N/A`,
      memberCount: participant.memberCount || 1,
      location: participant.location || "N/A"
    }

    // Reuse the exact same generation logic from generate-invoice
    const htmlContent = generateHtmlInvoice(invoiceData)

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        // 'Content-Disposition': `attachment; filename="invoice_${participant.paymentId}.html"` // uncomment if you want direct download instead of view in browser
      }
    })

  } catch (error) {
    console.error("Error generating invoice for admin:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

function generateHtmlInvoice(data: any): string {
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })

  const gstNumber = data.gstNumber || ""
  const taxAmount = data.taxAmount || 0
  const sellerStateCode = "33"
  
  let cgst = 0
  let sgst = 0
  let igst = 0
  let taxType = "INTRA" // Default for B2C
  
  if (gstNumber) {
    const buyerStateCode = gstNumber.substring(0, 2)
    if (buyerStateCode === sellerStateCode) {
      taxType = "INTRA"
      cgst = taxAmount / 2
      sgst = taxAmount / 2
    } else {
      taxType = "INTER"
      igst = taxAmount
    }
  } else {
    cgst = taxAmount / 2
    sgst = taxAmount / 2
  }

  const locationDisplay = data.businessName ? data.businessName : "Business Name"
  
  const taxRows = taxType === 'INTER' 
    ? '<tr><td>IGST (' + data.taxRate + '%):</td><td class="text-right">₹' + igst.toFixed(2) + '</td></tr>'
    : '<tr><td>CGST (' + ((data.taxRate || 0) / 2) + '%):</td><td class="text-right">₹' + cgst.toFixed(2) + '</td></tr>' +
      '<tr><td>SGST (' + ((data.taxRate || 0) / 2) + '%):</td><td class="text-right">₹' + sgst.toFixed(2) + '</td></tr>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - ${data.paymentId}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
    .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 15px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
    .header h1 { margin: 0; color: #c45a2d; font-size: 26px; text-transform: uppercase; }
    .header h2 { margin: 10px 0 0; font-size: 18px; color: #555; }
    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; font-weight: bold; }
    .from-to-box { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .box { width: 45%; }
    .box-title { font-weight: bold; margin-bottom: 10px; color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f8f8; font-weight: bold; }
    .text-right { text-align: right; }
    .totals-table { width: 50%; margin-left: auto; margin-top: 20px; border: none; }
    .totals-table td { padding: 8px 12px; border: none; }
    .total-row td { border-top: 2px solid #eee; font-weight: bold; font-size: 18px; }
    .footer { margin-top: 50px; text-align: center; color: #777; font-size: 13px; border-top: 1px solid #eee; padding-top: 20px; }
    @media print {
      body { padding: 0; }
      .invoice-box { box-shadow: none; border: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="header">
      <h1>RIFAH ANNUAL SUMMIT 2026</h1>
      <h2>TAX INVOICE</h2>
    </div>

    <div class="invoice-details">
      <div>Invoice Date: ${date}</div>
      <div>Payment ID: ${data.paymentId}</div>
    </div>

    <div class="from-to-box">
      <div class="box">
        <div class="box-title">FROM:</div>
        <strong>XYZ Events Pvt Ltd</strong><br>
        Chennai<br>
        GSTIN: 33XXXXX1234X1ZX
      </div>
      <div class="box">
        <div class="box-title">TO:</div>
        <strong>${data.name}</strong><br>
        ${locationDisplay}<br>
        GSTIN: ${gstNumber ? gstNumber.toUpperCase() : 'N/A'}<br>
        Mobile: ${data.mobileNumber}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-right">Taxable Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Event Registration (${data.ticketType || 'Standard'}) - ${data.memberCount || 1} Member(s)</td>
          <td class="text-right">₹${(data.baseAmount || 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <table class="totals-table">
      <tbody>
        ${taxRows}
        <tr class="total-row">
          <td>TOTAL:</td>
          <td class="text-right">₹${(data.totalAmount || 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p>Note: ITC claimable invoice. Registration fees are non-transferable and non-refundable.</p>
      <button class="no-print" onclick="window.print()" style="margin-top:20px; padding: 10px 20px; background: #c45a2d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Print / Save as PDF</button>
    </div>
  </div>
</body>
</html>`
}
