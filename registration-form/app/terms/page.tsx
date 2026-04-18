import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Terms & Conditions - RIFAH Annual Summit 2026",
  description: "Terms and conditions for RIFAH Annual Summit 2026 event registration",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Terms & Conditions
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            RIFAH Annual Summit 2026
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions</CardTitle>
            <CardDescription>
              Please read these terms carefully before registering for the event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-slate-700 dark:text-slate-300">
            {/* 1. Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">
                1. Introduction
              </h2>
              <p className="leading-relaxed">
                By registering for Rifah Annual Summit 2026, you agree to comply with all the terms and conditions mentioned below. This agreement is legally binding between the participant and the event organizer.
              </p>
            </section>

            {/* 2. Registration Rules */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">
                2. Registration Rules
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Registration is confirmed only after successful payment.</li>
                <li>Each participant must provide accurate personal details.</li>
                <li>Duplicate or fake registrations may be rejected.</li>
              </ul>
            </section>

            {/* 3. Payment Terms */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">
                3. Payment Terms
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>All payments are processed securely via Razorpay.</li>
                <li>Registration fees are non-transferable.</li>
                <li>GST (18%) will be applied where applicable.</li>
                <li>If a GST number is provided, it must be valid and active.</li>
              </ul>
            </section>

            {/* 4. GST Clause */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">
                4. GST Clause
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>If a GST number is provided, it will be verified before payment.</li>
                <li>Invalid GST numbers will result in rejection of registration.</li>
                <li>GST details will be reflected in the invoice where applicable.</li>
              </ul>
            </section>

            {/* 5. Cancellation & Refund */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">
                5. Cancellation & Refund
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Once registered, cancellation is not allowed.</li>
                <li>No refund will be provided after payment confirmation.</li>
                <li>The organizer reserves the right to cancel or reschedule the event.</li>
              </ul>
            </section>

            {/* 6. Event Changes */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">
                6. Event Changes
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>The organizer may change event date, venue, or schedule.</li>
                <li>Participants will be informed in advance.</li>
              </ul>
            </section>

            {/* 7. Liability */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">
                7. Liability
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>The organizer is not responsible for personal loss, injury, or damage during the event.</li>
                <li>Participants attend at their own risk.</li>
              </ul>
            </section>

            {/* 8. Data Usage */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">
                8. Data Usage
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Your personal data will be used only for event-related communication.</li>
                <li>We do not share your data with third parties.</li>
              </ul>
            </section>

            {/* 9. Acceptance Clause */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">
                9. Acceptance Clause
              </h2>
              <p className="leading-relaxed">
                By proceeding with registration, you confirm that you have read and accepted these Terms & Conditions.
              </p>
            </section>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Last updated: April 2026
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
