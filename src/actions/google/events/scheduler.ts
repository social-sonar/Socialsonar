'use server'

import prisma from '@/db'
import { z } from 'zod'
import { OAuth2Client } from 'google-auth-library'
import { google, calendar_v3 } from 'googleapis'
import { refreshToken } from '@/lib/utils/google'
import { TimeDuration } from '@/lib/definitions'

const createEventSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  guests: z.string().nullable().optional(),
})

type CreateEventSchemaFormState = {
  errors: {
    name?: string[]
    email?: string[]
    guests?: string[]
    _form?: string[]
  }
  success?: boolean
}

type EventData = {
  requesterName?: string
  requesterEmail?: string
  startDate?: string
  endDate?: string
  timezone?: string
  guests?: string[]
  description?: string
}

type BuilderEventData = EventData & { username: string; email: string }

const send = async (
  event: calendar_v3.Schema$Event,
  oauth2Client: OAuth2Client,
) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  try {
    const result = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all',
    })
    return result.data.id
  } catch (error) {
    if (error instanceof Error)
      throw new Error(
        `There was an error scheduling the event on the calendar service: ${error.message}`,
      )
  }
}

export const sendEventNotification = async (
  userId: string,
  eventBuilder: (data: BuilderEventData) => calendar_v3.Schema$Event,
  data?: EventData,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
    },
  })
  const event = eventBuilder({
    ...data,
    username: user?.name!,
    email: user?.email!,
  })
  const userGoogleAccount = await prisma.userGoogleAccount.findFirst({
    where: {
      userId,
    },
    include: {
      googleAccount: true,
    },
  })

  if (!userGoogleAccount) return

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL,
  )
  oauth2Client.setCredentials({
    access_token: userGoogleAccount.googleAccount.accessToken,
  })
  try {
    return await send(event, oauth2Client)
  } catch (error: unknown) {
    try {
      await refreshToken(userGoogleAccount.googleAccount, oauth2Client)
      return await send(event, oauth2Client)
    } catch (error) {
      throw error
    }
  }
}

export const scheduleEvent = async (
  userId: string,
  { timedelta, repr }: TimeDuration,
  timezone: string,
  startDate: Date,
  formState: CreateEventSchemaFormState,
  formData: FormData,
): Promise<CreateEventSchemaFormState> => {
  const result = createEventSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    guests: formData.get('guests'),
  })

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  try {
    const endDate = new Date(startDate.getTime() + timedelta)
    const guests =
      result.data.guests === '' ? undefined : result.data.guests?.split('\r\n')
    await prisma.event.create({
      data: {
        userId,
        start: startDate,
        end: endDate,
        timezone,
        eventDetails: {
          create: {
            requesterName: result.data.name,
            requesterEmail: result.data.email,
            guests,
          },
        },
      },
    })
    await sendEventNotification(
      userId,
      (data) => ({
        summary: `${data.username} and ${data.requesterName}`,
        description: `${data.description} event - Organizer will share a meeting URL if needed`,
        start: {
          dateTime: data.startDate,
          timeZone: data.timezone,
        },
        end: {
          dateTime: data.endDate,
          timeZone: data.timezone,
        },
        attendees: [
          data.email!,
          data.requesterEmail,
          ...(data.guests || []),
        ].map((email, idx) =>
          idx === 0
            ? { email, organizer: true, responseStatus: 'accepted' }
            : { email },
        ),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 },
          ],
        },
      }),
      {
        requesterName: result.data.name,
        requesterEmail: result.data.email,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        timezone,
        guests,
        description: repr,
      },
    )
  } catch (err) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['Something went wrong'],
        },
      }
    }
  }

  return { errors: {}, success: true }
}
