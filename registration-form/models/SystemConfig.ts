import mongoose from "mongoose"

const SystemConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        enum: ['smtp'], // Expandable for other configs
    },
    value: {
        host: String,
        port: Number,
        secure: Boolean,
        user: String,
        pass: String,
        fromEmail: String,
        originUrl: String,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    updatedBy: {
        type: String, // User ID or Email
    }
})

// Force re-compilation
if (process.env.NODE_ENV === "development" && mongoose.models.SystemConfig) {
    delete mongoose.models.SystemConfig
}

export default mongoose.models.SystemConfig || mongoose.model("SystemConfig", SystemConfigSchema)
