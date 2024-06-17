import prisma from '@/db'
import { TimeDuration, UserTimeInformation } from '../definitions'
import { notFound } from 'next/navigation'
import { getMinMaxDate } from '../utils/dates'
import { tz } from 'moment-timezone'

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
