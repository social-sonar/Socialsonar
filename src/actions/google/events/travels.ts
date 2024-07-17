'use server'

import prisma from '@/db'
import tzlookup from '@photostructure/tz-lookup'
import { sendEventNotification } from './scheduler'

type TravelData = {
  userId: string
  location: string
  coords: { lat: number; lon: number } // expected to be latitude,longitude
  startDate: string // expected to have the yyyy-mm-dd format
  endDate: string // expected to have the yyyy-mm-dd format
}

export const registerTravel = async ({
  userId,
  location,
  coords,
  startDate,
  endDate,
}: TravelData) => {
  const { lat, lon } = coords
  const googleEventId = await sendEventNotification(userId, (data) => ({
    summary: `Travel to ${location}`,
    location,
    description: `All day event`,
    organizer: { email: data.email },
    start: {
      date: startDate,
    },
    end: {
      date: endDate,
    },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'email', minutes: 24 * 60 * 7 }],
    },
  }))
  await prisma.event.create({
    data: {
      userId,
      googleEventId,
      start: `${startDate}T00:00:00.000Z`,
      end: `${endDate}T00:00:00.000Z`,
      timezone: 'not applicable', // events with no datetime have no timezone
      recurrence: `RRULE:FREQ=DAILY;UNTIL=${endDate.replaceAll('-', '')}T000000Z`,
      travel: {
        create: {
          userId,
          location,
          timezone: tzlookup(lat, lon),
        },
      },
    },
  })
}
