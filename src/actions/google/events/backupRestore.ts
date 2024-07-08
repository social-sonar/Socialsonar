'use server'

import {
  getSafeCalendarEvents,
  restoreGoogleEvents,
} from '@/lib/data/google/events/'
import { BackupFileData } from '@/lib/definitions'
import { getOAuthClient, getSession } from '@/lib/utils/common'
import { calendar_v3 } from 'googleapis'

type BackupPayload = {
  data: calendar_v3.Schema$Event[]
  id: string
}

export async function prepareBackup() {
  const session = await getSession()
  const { oauth2Client, googleAccount } = await getOAuthClient(session.user.id)
  const response = await getSafeCalendarEvents(
    oauth2Client,
    true,
    googleAccount,
  )
  if (response.data) {
    const responseText = JSON.stringify({
      data: response.data,
      id: session.user.id,
    })
    const encondedText = Buffer.from(responseText, 'utf8').toString('base64')

    return {
      email: session.user.email,
      data: encondedText,
      date: new Date(),
      user: session.user.name,
    } as BackupFileData
  }
}

export async function restoreBackup(data: string) {
  const decodedText = Buffer.from(data, 'base64').toString('utf8')
  const backupData: BackupPayload = JSON.parse(decodedText)
  return await restoreGoogleEvents(backupData.id, backupData.data)
}
