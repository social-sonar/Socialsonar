import { people_v1 } from 'googleapis'
import { BirthDay, CustomSession, DateRange, GoogleDate } from './definitions'
import nextAuth from '@/auth'

export function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export const dateString = ({ year, month, day }: GoogleDate): string =>
  `${year ? year + '/' : ''}${month}/${day}`

export const dateObject = (dateString: string): BirthDay => {
  let year, month, day
  const date = dateString.split('/')
  if (date.length === 2) {
    ;[month, day] = date
  } else {
    ;[year, month, day] = date
  }
  return {
    year: (year && parseInt(year)) || undefined,
    month: parseInt(month),
    day: parseInt(day),
  }
}

export const getSession = async () => {
  const session = (await nextAuth.auth()) as CustomSession
  if (!session) throw new Error('No session')
  return session
}

export const getContactIdFromResourceName = (
  payload: people_v1.Schema$Person,
) => {
  return payload.resourceName!.slice(7)
}

export const toLocalISOString = (date: Date): string => {
  const newDate = new Date(date)
  newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset())
  const [dateSegment, time] = newDate.toISOString().split('T')
  return `${dateSegment}T${time.slice(0, -5)}`
}

export const getMinMaxDate = (date: string): DateRange => {
  const [year, month] = date.split('-').map(Number)
  const maxDate = new Date(year, month, 0)
  const minDate = new Date(year, month - 1, 1)
  return {
      minDate,
      maxDate
  }
}