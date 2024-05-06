import { GoogleDate } from "./definitions"

export function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export const dateString = ({ year, month, day }: GoogleDate): string => `${year}/${month}/${day}`