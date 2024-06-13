'use server'

import prisma from '@/db'
import { z } from 'zod'
import { OAuth2Client } from 'google-auth-library'
import { google, calendar_v3 } from 'googleapis'
import { refreshToken } from '@/lib/utils/google'
import { EventServiceError } from '@/lib/utils/common'

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
  userId: string
  requesterName: string
  requesterEmail: string
  startDate: string
  endDate: string
  timezone: string
  guests?: string[]
}

const send = async (
  event: calendar_v3.Schema$Event,
  oauth2Client: OAuth2Client,
) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  try {
    await calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      requestBody: event,
      sendNotifications: true
    })
  } catch (error) {
    if (error instanceof Error)
      throw new EventServiceError(
        `There was an error scheduling the event on the calendar service: ${error.message}`,
      )
  }
}

const sendEventNotification = async ({
  userId,
  requesterName,
  requesterEmail,
  startDate,
  endDate,
  timezone,
  guests,
}: EventData): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
    },
  })
  const event: calendar_v3.Schema$Event = {
    summary: `${user!.name} and ${requesterName}`,
    location: 'Organizer will send a meeting URL if needed',
    organizer: { email: user?.email! },
    start: {
      dateTime: startDate,
      timeZone: timezone,
    },
    end: {
      dateTime: endDate,
      timeZone: timezone,
    },
    attendees: [requesterEmail, ...(guests || [])].map((email) => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 },
      ],
    },
  }

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
    await send(event, oauth2Client)
  } catch (error: unknown) {
    if (error instanceof EventServiceError) throw error
    try {
      await refreshToken(userGoogleAccount.googleAccount, oauth2Client)
      await send(event, oauth2Client)
    } catch (error) {
      throw error
    }
  }
}

export const scheduleEvent = async (
  userId: string,
  timedelta: number,
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
    const guests = result.data.guests?.split('\r\n')
    await prisma.event.create({
      data: {
        userId,
        requesterName: result.data.name,
        requesterEmail: result.data.email,
        start: startDate,
        end: endDate,
        guests,
      },
    })
    await sendEventNotification({
      userId,
      requesterName: result.data.name,
      requesterEmail: result.data.email,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      timezone,
      guests,
    })
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
