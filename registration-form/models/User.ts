import mongoose from "mongoose"

interface IUserDocument {
    email: string
    password?: string
    role: string
    inviteToken?: string
    inviteTokenExpiry?: Date
    createdAt: Date
}

const UserSchema = new mongoose.Schema<IUserDocument>({
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
    },
    password: {
        type: String,
        required: function (this: IUserDocument) {
            // Password is required only if inviteToken is NOT present
            // If inviteToken is present, it means user is invited and hasn't set password yet
            return !this.inviteToken
        },
    },
    role: {
        type: String,
        default: "admin",
    },
    inviteToken: {
        type: String,
        unique: true,
        sparse: true,
    },
    inviteTokenExpiry: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

if (process.env.NODE_ENV === "development" && mongoose.models.User) {
    delete mongoose.models.User
}

export default mongoose.models.User || mongoose.model("User", UserSchema)
