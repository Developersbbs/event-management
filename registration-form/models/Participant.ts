import mongoose from "mongoose"

const ParticipantSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: false, // Optional initially, but required for full reg
    },
    groupNumber: {
        type: String, // Storing as string to handle "Covai Group" etc.
        required: false,
    },
    ageGroups: {
        adults: { type: Number, default: 0 },
        children: { type: Number, default: 0 },
    },
    foodPreference: {
        veg: { type: Number, default: 0 },
        nonVeg: { type: Number, default: 0 },
    },

    isMorningFood: {
        type: Boolean,
        default: false,
    },
    isRegistered: {
        type: Boolean,
        default: false,
    },
    checkIn: {
        isCheckedIn: { type: Boolean, default: false },
        memberPresent: { type: Boolean, default: false },
        timestamp: { type: Date },
        actualAdults: { type: Number },
        actualChildren: { type: Number },
        checkedInBy: { type: String }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
})

// Force re-compilation of model in dev to apply schema changes
if (process.env.NODE_ENV === "development" && mongoose.models.Participant) {
    delete mongoose.models.Participant
}

export default mongoose.models.Participant || mongoose.model("Participant", ParticipantSchema)
