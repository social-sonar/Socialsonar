import prisma from '@/db'
import { TimeDuration, UserTimeInformation } from '../definitions'
import { notFound } from 'next/navigation'
import { getMinMaxDate } from '../utils'

const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date < endDate
}

export const getUserData = async (
  userId: string,
  month: string,
  durationMetadata: TimeDuration,
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

  const events = user?.events || []
  const minMaxDates = getMinMaxDate(month)
  const finalTimeData: Map<string, string[]> = new Map<string, string[]>()
  const days = Array.from(
    { length: minMaxDates.maxDate.getDate() },
    (_, i) => i + 1,
  )
  days.forEach((day) => {
    const dateStr = `${month}-${day.toString().padStart(2, '0')}`
    const data: string[] = []
    const validStartDate = new Date(`${dateStr}T08:00:00-00:00`)
    const validEndDate = new Date(`${dateStr}T17:00:00-00:00`)
    let currentTime = new Date(validStartDate) // 8:00

    while (currentTime < validEndDate) {
      let endTime = new Date(currentTime.getTime() + durationMetadata.timedelta)
      const [hours, minutes, ] = (currentTime as Date).toISOString().split('T')[1].split(':');
      data.push(`${hours}:${minutes}`)
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

  if (!user) notFound()

  return {
    user: {
      id: user.id,
      name: user.name!,
    },
    availableTime: finalTimeData,
  }
}
