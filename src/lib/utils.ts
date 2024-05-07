import { BirthDay, GoogleDate } from "./definitions"

export function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export const dateString = ({ year, month, day }: GoogleDate): string => `${year ? year + '/' : ''}${month}/${day}`

export const dateObject = (dateString: string): BirthDay => {
  let year, month, day;
  const date = dateString.split('/')
  if (date.length === 2) {
    [month, day] = date
  }
  else {
    [year, month, day] = date
  }
  return {
    year: year && parseInt(year) || undefined,
    month: parseInt(month),
    day: parseInt(day)
  }
}