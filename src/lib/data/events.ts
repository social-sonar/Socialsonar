'use server'

import prisma from '@/db'
import { refreshToken } from '@/lib/utils/google'
import { GoogleAccount } from '@prisma/client'
import { OAuth2Client } from 'google-auth-library'
import { calendar_v3, google } from 'googleapis'
import { tz } from 'moment-timezone'
import { notFound } from 'next/navigation'
import { TimeDuration, UserTimeInformation } from '../definitions'
import { getMinMaxDate } from '../utils/dates'

type CalendarRequestResult = {
  syncToken: string
  data: calendar_v3.Schema$Event[]
}

const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date < endDate
}

export const getUserData = async (
  userId: string,
  month: string,
  durationMetadata: TimeDuration,
  timezone: string,
): Promise<UserTimeInformation> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      events: {
        where: {
          AND: [
            {
              start: { gte: new Date(month) },
            },
            {
              start: { gte: new Date() },
            },
          ],
        },
        select: {
          start: true,
          end: true,
        },
      },
    },
  })

  if (!user) notFound()

  const events = user?.events || []
  const minMaxDates = getMinMaxDate(month)
  const finalTimeData: Map<string, Date[]> = new Map<string, Date[]>()
  const days = Array.from(
    { length: minMaxDates.maxDate.getDate() },
    (_, i) => i + 1,
  )
  days.forEach((day) => {
    const dateStr = `${month}-${day.toString().padStart(2, '0')}`
    const data: Date[] = []
    const validStartDate = tz(`${dateStr} 08:00:00`, timezone).toDate()
    const validEndDate = tz(`${dateStr} 17:00:00`, timezone).toDate()
    let currentTime = new Date(validStartDate)

    while (currentTime < validEndDate) {
      let endTime = new Date(currentTime.getTime() + durationMetadata.timedelta)
      data.push(currentTime as Date)
      for (let index = 0; index < events.length; index++) {
        const event = events[index]
        if (event.start.getDate() === currentTime.getDate()) {
          if (
            isDateInRange(currentTime, event.start, event.end) ||
            isDateInRange(endTime, event.end, event.start) ||
            (event.start > currentTime && endTime > event.start)
          ) {
            data.pop()
          }
        }
      }
      currentTime = new Date(endTime)
      if (endTime > validEndDate) {
        endTime = new Date(validEndDate)
      }
    }

    finalTimeData.set(dateStr, data)
  })

  return {
    user: {
      id: user.id,
      name: user.name!,
    },
    availableTime: finalTimeData,
  }
}

const getCalendarEvents = async (
  oauth2Client: OAuth2Client,
  syncToken?: string,
): Promise<CalendarRequestResult> => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  const results = await calendar.events.list({
    auth: oauth2Client,
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    syncToken,
  })
  return {
    data: results.data.items || [],
    syncToken: results.data.nextSyncToken!,
  }
}

export const syncGoogleCalendar = async (
  userId: string,
  googleAccount: GoogleAccount,
): Promise<void> => {
  let results: CalendarRequestResult | null = null
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL,
  )
  oauth2Client.setCredentials({
    access_token: googleAccount.accessToken,
  })
  try {
    results = await getCalendarEvents(
      oauth2Client,
      googleAccount.calendarToken || undefined,
    )
  } catch (error: unknown) {
    try {
      await refreshToken(googleAccount, oauth2Client)
      results = await getCalendarEvents(
        oauth2Client,
        googleAccount.calendarToken || undefined,
      )
    } catch (error) {
      throw error
    }
  }

  await prisma.event.createMany({
    data: results.data.map((event) => ({
      userId,
      googleEventId: event.id,
      start: event.start?.dateTime!,
      end: event.end?.dateTime!,
      timezone: event.start?.timeZone!,
    })),
  })
  await prisma.googleAccount.update({
    where: {
      id: googleAccount.id,
    },
    data: {
      calendarToken: results.syncToken,
    },
  })
}
