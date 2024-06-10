'use server'

import prisma from '@/db'
import { z } from 'zod'

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

export const scheduleEvent = async (
  userId: string,
  timedelta: number,
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
    await prisma.event.create({
      data: {
        userId,
        requesterName: result.data.name,
        requesterEmail: result.data.email,
        start: startDate,
        end: new Date(startDate.getTime() + timedelta),
        guests: result.data.guests?.split('\r\n'),
      },
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
