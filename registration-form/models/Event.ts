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

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // super admin
    },

}, { timestamps: true })

export default mongoose.models.Event || mongoose.model("Event", eventSchema)