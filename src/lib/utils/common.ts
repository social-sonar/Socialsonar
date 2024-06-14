import { people_v1 } from 'googleapis'
import { CustomSession } from '@/lib/definitions'
import nextAuth from '@/auth'

export const getSession = async () => {
  return (await nextAuth.auth()) as CustomSession
}

export const getContactIdFromResourceName = (
  payload: people_v1.Schema$Person,
) => {
  return payload.resourceName!.slice(7)
}