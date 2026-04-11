import { NextRequest, NextResponse } from 'next/server'
import dbConnect from "@/lib/db"
import Event from '@/models/Event'
import { getCurrentUser } from '@/lib/auth'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await dbConnect()

    const events = await Event.find({})
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(events)

  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const user = await getCurrentUser()

    // AUTH CHECK
    if (!user || user.role !== 'super-admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only super admin allowed.' },
        { status: 403 }
      )
    }

    // ✅ FINAL SAFE VERSION
    const userId = user.id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const {
      eventName,
      startDate,
      endDate,
      location,
      maxCapacity
    } = body

    // VALIDATION
    if (!eventName || !startDate || !endDate || !location) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // DATE VALIDATION
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { error: 'Start date cannot be after end date' },
        { status: 400 }
      )
    }

    //  CREATE EVENT
    const event = new Event({
      eventName,
      startDate,
      endDate,
      location,
      maxCapacity: maxCapacity || 100,
      createdBy: userId //  FIXED
    })

    await event.save()

    return NextResponse.json(event, { status: 201 })

  } catch (error: any) {
    console.error('Error creating event:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    )
  }
}