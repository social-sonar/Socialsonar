import { people_v1 } from 'googleapis'
import { BirthDay, CustomSession, GoogleDate } from './definitions'
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
  return (await nextAuth.auth()) as CustomSession
}

export const getContactIdFromResourceName = (
  payload: people_v1.Schema$Person,
) => {
  return payload.resourceName!.slice(7)
}
