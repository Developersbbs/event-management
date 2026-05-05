import crypto from "crypto"
import Participant from "@/models/Participant"
import Event from "@/models/Event"
import mongoose from "mongoose"

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-razorpay-signature")

    if (!signature) {
      return Response.json({ error: "Missing signature" }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || ""
    if (secret) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex")

      if (expectedSignature !== signature) {
        return Response.json({ error: "Invalid signature" }, { status: 400 })
      }
    } else {
      console.warn("RAZORPAY_WEBHOOK_SECRET not set, skipping signature verification")
    }

    const event = JSON.parse(body)
    console.log("Razorpay Webhook Event:", event.event)

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id
      const paymentId = payment.id

      await mongoose.connect(process.env.MONGODB_URI!)

      // Find participant by order ID
      const participant = await Participant.findOneAndUpdate(
        { razorpayOrderId: orderId },
        {
          $set: {
            paymentStatus: "completed",
            paymentId: paymentId,
            approvalStatus: "approved",
            isRegistered: true,
          },
        },
        { new: true }
      )

      if (participant && participant.paymentStatus === "completed") {
        console.log("Participant updated via webhook:", participant._id)

        // Only send email if not already sent (though we added check in verify too)
        // Fetch event to get name
        const activeEvent = await Event.findById(participant.eventId).lean()
        if (activeEvent) {
          const { sendRegistrationEmails } = await import("@/lib/email")
          // We can't easily check if email was already sent unless we add a flag to DB
          // But sending twice is better than not sending at all
          sendRegistrationEmails(participant as any, activeEvent.eventName).catch(err =>
            console.error("Failed to send registration emails from webhook:", err)
          )
        }
      } else if (!participant) {
        console.warn("No participant found for orderId:", orderId)
        // Optionally create from payment data if it's completely missing
      }
    }

    return Response.json({ success: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
