import { useState, useEffect } from "react"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"
import { app } from "@/lib/firebase"
import { getAuth } from "firebase/auth"

export function usePhoneAuth() {
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const auth = getAuth(app)
    auth.useDeviceLanguage()

    useEffect(() => {
        // Initialize RecaptchaVerifier on mount
        if (!window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                    size: "invisible",
                    callback: () => {
                        // reCAPTCHA solved, allow signInWithPhoneNumber.
                    },
                    "expired-callback": () => {
                        setError("Recaptcha expired. Please try again.")
                    }
                })
            } catch (err) {
                console.error("Recaptcha initialization failed", err)
            }
        }
    }, [auth])

    const sendOtp = async (phoneNumber: string) => {
        setLoading(true)
        setError(null)
        try {
            if (!window.recaptchaVerifier) {
                throw new Error("Recaptcha not initialized")
            }

            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
            setConfirmationResult(confirmation)
            return true
        } catch (err: any) {
            console.error("Error sending OTP:", err)
            setError(err.message || "Failed to send OTP")
            // Reset recaptcha on error so it can be retried
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear()
                window.recaptchaVerifier = undefined
            }
            return false
        } finally {
            setLoading(false)
        }
    }

    const verifyOtp = async (otp: string) => {
        setLoading(true)
        setError(null)
        try {
            if (!confirmationResult) {
                throw new Error("No OTP sent")
            }
            const result = await confirmationResult.confirm(otp)
            return result.user
        } catch (err: any) {
            console.error("Error verifying OTP:", err)
            setError(err.message || "Invalid OTP")
            return null
        } finally {
            setLoading(false)
        }
    }

    return { sendOtp, verifyOtp, loading, error }
}

declare global {
    interface Window {
        recaptchaVerifier: any
    }
}
