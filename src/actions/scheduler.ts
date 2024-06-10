'use server'

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

  return {errors: {}}
}
