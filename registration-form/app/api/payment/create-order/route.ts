import Razorpay from "razorpay"

export async function POST(req: Request) {
  try {
    // Check if env variables are set
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay environment variables")
      return Response.json(
        { error: "Payment configuration error" },
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const body = await req.json()
    console.log("Create order request body:", body)

    const { amount } = body

    if (!amount) {
      console.error("Missing required field: amount")
      return Response.json(
        { error: "Missing required field: amount" },
        { status: 400 }
      )
    }

    console.log("Creating Razorpay order with amount:", amount)

    const order = await razorpay.orders.create({
      amount: amount * 100, // ₹ → paise
      currency: "INR",
      receipt: "order_" + Date.now(),
    })

    console.log("Razorpay order created successfully:", order.id)
    return Response.json(order)
  } catch (error: unknown) {
    console.error("Error creating Razorpay order:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create order"
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
