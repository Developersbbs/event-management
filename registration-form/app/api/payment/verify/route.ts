import crypto from "crypto"
import Participant from "@/models/Participant"
import Event from "@/models/Event"
import mongoose from "mongoose"
import { generateInvoiceFile } from "../generate-invoice/route"

export async function POST(req: Request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)

    const body = await req.json()

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      registrationData,
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!registrationData) {
      return Response.json(
        { error: "Missing registration data" },
        { status: 400 }
      )
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex")

    if (expected !== razorpay_signature) {
      return Response.json({ success: false, error: "Invalid signature" }, { status: 400 })
    }

    // ✅ Create participant after successful payment
    let participant
    try {
      participant = await Participant.create({
        ...registrationData,
        paymentStatus: "completed",
        paymentMethod: "online",
        paymentId: razorpay_payment_id,
        approvalStatus: "approved",
        isRegistered: true,
      })
    } catch (createError: unknown) {
      console.error("Failed to create participant in DB:", createError)

      // Handle duplicate mobileNumber (unique index violation)
      if (createError && typeof createError === 'object' && 'code' in createError && createError.code === 11000) {
        // Participant already exists — update payment info instead
        const existing = await Participant.findOneAndUpdate(
          { mobileNumber: registrationData.mobileNumber },
          {
            $set: {
              paymentStatus: "completed",
              paymentMethod: "online",
              paymentId: razorpay_payment_id,
              approvalStatus: "approved",
              isRegistered: true,
              razorpayOrderId: razorpay_order_id,
            },
          },
          { new: true }
        )
        if (existing) {
          console.log("Updated existing participant with payment info:", existing._id)
          
          let invoiceUrl = ""
          try {
            const invoiceData = {
              name: registrationData.name,
              email: registrationData.email,
              mobileNumber: registrationData.mobileNumber,
              businessName: registrationData.businessName,
              gstNumber: registrationData.gstNumber,
              ticketType: registrationData.ticketType,
              baseAmount: registrationData.baseAmount || 0,
              taxAmount: registrationData.taxAmount || 0,
              totalAmount: registrationData.totalAmount || 0,
              taxRate: registrationData.taxRate || 0,
              paymentId: razorpay_payment_id,
              memberCount: registrationData.memberCount || 1,
              location: registrationData.location
            }
            invoiceUrl = await generateInvoiceFile(invoiceData)
          } catch (invoiceError) {
            console.error("Failed to generate invoice HTML file (non-fatal):", invoiceError)
          }

          return Response.json({ success: true, participantId: existing._id.toString(), invoiceUrl })
        }
      }

      const errorMessage = createError instanceof Error ? (createError as Error).message : "Failed to save registration"
      return Response.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }

    // Update event counts
    try {
      const activeEvent = await Event.findById(registrationData.eventId)
      if (activeEvent) {
        const selectedTicket = activeEvent.ticketsPrice.find(
          (t: { name: string; price: number }) => t.name === registrationData.ticketType
        )
        if (selectedTicket) {
          selectedTicket.soldCount = (selectedTicket.soldCount || 0) + (registrationData.memberCount || 1)
          await activeEvent.save()
        }
        await Event.findByIdAndUpdate(
          registrationData.eventId,
          { $inc: { registeredCount: registrationData.memberCount || 1 } }
        )
      }
    } catch (eventError) {
      console.error("Failed to update event counts (non-fatal):", eventError)
      // Non-fatal — participant is already saved, just log the error
    }

    // Generate Invoice HTML file for online payment
    let invoiceUrl = ""
    try {
      const invoiceData = {
        name: registrationData.name,
        email: registrationData.email,
        mobileNumber: registrationData.mobileNumber,
        businessName: registrationData.businessName,
        gstNumber: registrationData.gstNumber,
        ticketType: registrationData.ticketType,
        baseAmount: registrationData.baseAmount || 0,
        taxAmount: registrationData.taxAmount || 0,
        totalAmount: registrationData.totalAmount || 0,
        taxRate: registrationData.taxRate || 0,
        paymentId: razorpay_payment_id,
        memberCount: registrationData.memberCount || 1,
        location: registrationData.location
      }
      invoiceUrl = await generateInvoiceFile(invoiceData)
    } catch (invoiceError) {
      console.error("Failed to generate invoice HTML file (non-fatal):", invoiceError)
    }

    console.log("Participant saved successfully:", participant._id)
    return Response.json({ success: true, participantId: participant._id.toString(), invoiceUrl })
  } catch (error: unknown) {
    console.error("Error in payment verify route:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to verify payment"
    return Response.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
