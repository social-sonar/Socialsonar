import { BirthDay, DateRange, GoogleDate } from '@/lib/definitions'

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
    maxDate,
  }
}

export const localTime = (timeZone: string, date?: Date) => {
  const actualDate = date ?? new Date()
  const timeString = actualDate.toLocaleTimeString('en-US', {
    timeZone,
    hour12: false,
  })
  return timeString.slice(0, -3)
}

export const localDayNumber = (timeZone: string, date: Date) => {
  const dateString = date.toLocaleDateString('en-US', {
    timeZone,
    hour12: false,
  })
  return parseInt(dateString.split('/')[1])
}
