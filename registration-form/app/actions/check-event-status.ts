import dbConnect from "@/lib/db"
import Event from "@/models/Event"

export interface EventStatus {
  isActive: boolean
  isUpcoming: boolean
  isPast: boolean
  event?: {
    _id: string
    eventName: string
    startDate: Date
    endDate: Date
    location: string
    maxCapacity: number
    registeredCount: number
  }
  message?: string
}

export async function getEventStatus(): Promise<EventStatus> {
  try {
    await dbConnect()
    
    const now = new Date()
    const activeEvent = await Event.findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ createdAt: -1 })
    
    if (!activeEvent) {
      // Check if there's any upcoming event
      const upcomingEvent = await Event.findOne({
        isActive: true,
        startDate: { $gt: now }
      }).sort({ startDate: 1 })
      
      if (upcomingEvent) {
        return {
          isActive: false,
          isUpcoming: true,
          isPast: false,
          event: upcomingEvent,
          message: `Registration will open on ${upcomingEvent.startDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`
        }
      }
      
      return {
        isActive: false,
        isUpcoming: false,
        isPast: false,
        message: "No events scheduled at the moment"
      }
    }
    
    // Check if event is at full capacity
    if (activeEvent.registeredCount >= activeEvent.maxCapacity) {
      return {
        isActive: false,
        isUpcoming: false,
        isPast: false,
        event: activeEvent,
        message: "Registration is closed due to maximum capacity"
      }
    }
    
    return {
      isActive: true,
      isUpcoming: false,
      isPast: false,
      event: activeEvent
    }
  } catch (error) {
    console.error("Error checking event status:", error)
    return {
      isActive: false,
      isUpcoming: false,
      isPast: false,
      message: "Unable to check registration status"
    }
  }
}
