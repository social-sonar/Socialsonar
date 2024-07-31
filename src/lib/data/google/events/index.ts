'use server'

import prisma from '@/db'
import { refreshToken } from '@/lib/utils/google'
import { GoogleAccount } from '@prisma/client'
import { OAuth2Client } from 'google-auth-library'
import { calendar_v3, google } from 'googleapis'
import { tz } from 'moment-timezone'
import { notFound } from 'next/navigation'
import {
  LightEvent,
  TimeDuration,
  UserTimeInformation,
} from '../../../definitions'
import { getDayID, getMinMaxDate } from '../../../utils/dates'
import { getOAuthClient } from '../../../utils/common'

type CalendarRequestResult = {
  syncToken: string
  data: calendar_v3.Schema$Event[]
}

type SyncedEvents = {
  toUpdate: calendar_v3.Schema$Event[]
  toCreate: calendar_v3.Schema$Event[]
}

type Recurrence = {
  freq?: string
  until?: string | Date
  count?: string
  interval?: string
  byday?: string[] | string
  wkst?: string
}

const extractRecurrenceProperties = (recurrence: string): Recurrence => {
  let regex = /(\w+)=([a-zA-Z0-9,]+)/g
  let match: RegExpExecArray | null = null
  const properties: Recurrence = {}
  while ((match = regex.exec(recurrence)) !== null) {
    properties[match[1].toLowerCase() as keyof Recurrence] = match[2]
  }
  properties.byday = (properties.byday as string)?.split(',')

  properties.until = properties.until && tz(properties.until, 'UTC').toDate()

  return properties
}

const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date < endDate
}

const fixEventByRecurrence = (
  currenDate: Date,
  event: LightEvent,
): LightEvent => {
  const { until, byday } = extractRecurrenceProperties(event.recurrence)
  const dayId = getDayID(currenDate)
  // until is a date that specifies how long a given event will occur
  // If `until` does not exist but `byday` does, the event is considered recurrent with no "expiration date", happening in the days
  // described by `byday`, that's why if both `until` and `byday` are undefined or do not meet the conditions, the current event
  // is not updated
  if (
    (!until || (until && (until as Date) < currenDate)) &&
    (!byday || !byday.includes(dayId))
  )
    return event
  // event.start and event.end are the original dates of the event, so they must be replaced using the current date
  // and a calculated timedelta. All these transformations are valid as long as the `until` date is later than the current date
  // or the event is recurrent with no "expiration date"
  const timedelta = event.end.getTime() - event.start.getTime()
  event.start.setFullYear(currenDate.getFullYear())
  event.start.setMonth(currenDate.getMonth())
  event.start.setDate(currenDate.getDate())
  event.end = new Date(event.start.getTime() + timedelta)
  return event
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
          OR: [
            {
              AND: [
                {
                  start: { gte: new Date(month) },
                },
                {
                  start: { gte: new Date() },
                },
              ],
            },
            {
              recurrence: {
                contains: 'BYDAY',
              },
            },
          ],
        },
        select: {
          start: true,
          end: true,
          recurrence: true,
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
        const event = fixEventByRecurrence(currentTime, events[index])

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
  firstSync: boolean,
  syncToken?: string,
): Promise<CalendarRequestResult> => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const results = await calendar.events.list({
    auth: oauth2Client,
    calendarId: 'primary',
    ...(firstSync ? { timeMin: new Date().toISOString() } : { syncToken }),
  })
  const currentDatetime = new Date()
  const events = results.data.items?.filter((event) => {
    const until = event.recurrence?.[0].match(/(?<=UNTIL=)\w+/)?.[0]
    // filter out events before the current date. This is necessary because the `timeMin` parameter of
    // events.list cannot be used in conjunction with a sync token
    return (
      (new Date(event.start?.dateTime!) > currentDatetime ||
        (until && tz(until, 'UTC').toDate() > currentDatetime) ||
        (!until && event.recurrence?.[0])) &&
      event.status !== 'cancelled'
    )
  })

  return {
    data: events || [],
    syncToken: results.data.nextSyncToken!,
  }
}

export const getSafeCalendarEvents = async (
  oauth2Client: OAuth2Client,
  firstSync: boolean,
  googleAccount?: GoogleAccount,
): Promise<CalendarRequestResult> => {
  let results: CalendarRequestResult | null = null
  try {
    results = await getCalendarEvents(
      oauth2Client,
      firstSync,
      googleAccount!.calendarToken || undefined,
    )
  } catch (error: unknown) {
    try {
      await refreshToken(googleAccount!, oauth2Client)
      results = await getCalendarEvents(
        oauth2Client,
        firstSync,
        googleAccount!.calendarToken || undefined,
      )
    } catch (error) {
      throw error
    }
  }
  return results
}

export const syncGoogleCalendar = async (
  userId: string,
  googleAccount?: GoogleAccount,
  firstSync: boolean = false,
): Promise<void> => {
  const authResult = await getOAuthClient(userId, googleAccount)
  const results = await getSafeCalendarEvents(
    authResult.oauth2Client,
    firstSync,
    authResult.googleAccount,
  )

  const syncData = await getEventsSyncData(results.data)

  syncData.toUpdate.forEach(
    async (event) =>
      await prisma.event.updateMany({
        where: {
          googleEventId: event.id!,
        },
        data: {
          start: event.start?.dateTime || `${event.start?.date!}T00:00:00.000Z`,
          end: event.end?.dateTime! || `${event.end?.date!}T00:00:00.000Z`,
          timezone: event.start?.timeZone || 'not applicable', // events with no datetime have no timezone
          recurrence: event.recurrence?.[0],
        },
      }),
  )

  await prisma.event.createMany({
    data: syncData.toCreate.map((event) => ({
      userId,
      googleEventId: event.id,
      start: event.start?.dateTime || `${event.start?.date!}T00:00:00.000Z`,
      end: event.end?.dateTime! || `${event.end?.date!}T00:00:00.000Z`,
      timezone: event.start?.timeZone || 'not applicable', // events with no datetime have no timezone
      recurrence: event.recurrence?.[0],
    })),
  })
  await prisma.googleAccount.update({
    where: {
      id: authResult.googleAccount!.id,
    },
    data: {
      calendarToken: results.syncToken,
    },
  })
}

export const getEventsSyncData = async (
  syncResults: calendar_v3.Schema$Event[],
): Promise<SyncedEvents> => {
  const eventsIds = syncResults.map((event) => event.id!)
  const existingEvents = await prisma.event.findMany({
    where: {
      googleEventId: {
        in: eventsIds,
      },
    },
    select: {
      id: true,
      googleEventId: true,
    },
  })
  const existingEventsIdsSet = new Set(
    existingEvents.map((dbEvent) => dbEvent.googleEventId),
  )
  return syncResults.reduce(
    (acc, syncEvent) => {
      if (existingEventsIdsSet.has(syncEvent.id!)) {
        // existing events IDs
        acc.toUpdate.push(syncEvent)
      } else {
        // non existing events IDs
        acc.toCreate.push(syncEvent)
      }
      return acc
    },
    {
      toUpdate: [],
      toCreate: [],
    } as SyncedEvents,
  )
}

export const restoreGoogleEvents = async (
  userId: string,
  backedupEvents: calendar_v3.Schema$Event[],
) => {
  const { oauth2Client, googleAccount } = await getOAuthClient(userId)

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const events = await getSafeCalendarEvents(oauth2Client, true, googleAccount)

  console.log('Events to delete: ', events.data.length, googleAccount.email)

  events.data.forEach(
    async (event) => await calendar.events.delete({ eventId: event.id! }),
  )
  backedupEvents.forEach(async (event) => {
    try {
      await calendar.events.insert({
        auth: oauth2Client,
        calendarId: 'primary',
        requestBody: event,
        sendNotifications: true,
      })
    } catch (error) {
      console.log('Error creating event. Cause:', error)
    }
  })

  return { processed: backedupEvents.length }
}
