"use client"

import { useState, useMemo, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updateParticipant } from "@/app/actions/edit-participant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Plus, Minus, Users, Utensils, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
// import { toast } from "sonner"
import { IParticipant } from "@/lib/types"
// Assuming sonner or toast is available? If not, simple alert or callback. 
// I'll stick to props based callback or internal state.

const personalDetailsSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    location: z.string().min(1, "Please enter your location"),
    mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
})

interface EditParticipantDialogProps {
    participant: IParticipant
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditParticipantDialog({ participant, open, onOpenChange, onSuccess }: EditParticipantDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dbError, setDbError] = useState<string | null>(null)

    // Event Data State
    const [eventData, setEventData] = useState({
        guestCount: 0,
        ageGuest: 0,
    })

    const form = useForm<z.infer<typeof personalDetailsSchema>>({
        resolver: zodResolver(personalDetailsSchema),
        defaultValues: {
            name: participant.name,
            location: participant.location,
            mobileNumber: participant.mobileNumber,
        }
    })

    // Reset state when participant changes (if dialog re-opens with different user)
    useEffect(() => {
        if (open && participant) {
            setEventData({
                guestCount: 0,
                ageGuest: 0,
            })
            form.reset({
                name: participant.name,
                location: participant.location,
                mobileNumber: participant.mobileNumber,
            })
            setDbError(null)
        }
    }, [open, participant, form])

    // --- Derived State (Pricing) ---
    const totalMembers = useMemo(() => {
        return 1 + (participant.secondaryMembers?.length || 0)
    }, [participant.secondaryMembers])


    // --- Handlers ---


    const onSubmit = async (data: z.infer<typeof personalDetailsSchema>) => {
        setIsSubmitting(true)
        setDbError(null)
        try {
            const payload = {
                ...data,
                guestCount: 0,
                ageGroups: { guest: 0 },
            }

            const result = await updateParticipant(participant._id, payload)
            if (result.success) {
                onOpenChange(false)
                if (onSuccess) onSuccess()
                // Optional: Toast success
            } else {
                setDbError(result.error || "Update failed.")
            }
        } catch {
            setDbError("An unexpected error occurred.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Participant</DialogTitle>
                    <DialogDescription>
                        Make changes to the participant details here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Form {...form}>
                        <form id="edit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* Personal Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Personal Details</h3>
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl><Input placeholder="Name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile Number</FormLabel>
                                        <FormControl><Input placeholder="+91..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="location" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl><Input placeholder="Enter your location (e.g. Covai, Trichy)" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <Separator />

                            {/* Event Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    <h3 className="text-sm font-medium text-muted-foreground">Guest Count</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setEventData(prev => ({ ...prev, guestCount: Math.max(0, prev.guestCount - 1) }))}
                                        disabled={true}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xl font-semibold w-8 text-center">0</span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={true}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs text-muted-foreground">
                                        Total Participation: {totalMembers}
                                    </span>
                                </div>
                            </div>


                            {dbError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{dbError}</AlertDescription></Alert>}

                        </form>
                    </Form>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" form="edit-form" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
