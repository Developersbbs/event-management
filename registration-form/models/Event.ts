import mongoose from "mongoose"

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
    },

    startDate: {
        type: Date,
        required: true,
    },

    endDate: {
        type: Date,
        required: true,
    },

    location: {
        type: String,
        required: true,
    },

    maxCapacity: {
        type: Number,
        default: 100,
    },

    registeredCount: {
        type: Number,
        default: 0,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    //  TICKET PRICING SYSTEM
    ticketsPrice: [
        {
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            soldCount: {
                type: Number,
                default: 0,
            },
        }
    ],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

}, { timestamps: true })

// FIX (VERY IMPORTANT)
if (mongoose.models.Event) {
    delete mongoose.models.Event
}

export default mongoose.model("Event", eventSchema)