jest.mock('../../../../src/actions/google/events/scheduler')
import { registerTravel } from '@/actions/google/events/travels'
import { prismaMock } from '../../../../singleton'
import { sendEventNotification } from '@/actions/google/events/scheduler'

describe('Register travel', () => {
  const userId = 'abc'
  const location = 'Los Angeles'
  const coords = { lat: 34, lon: -118 }
  const startDate = '2024-07-24'
  const endDate = '2024-07-24'
  it("should register travel without adding it to the user's calendar", async () => {
    await registerTravel({
      userId,
      location,
      coords,
      startDate,
      endDate,
      calendarAction: false,
    })
    expect(prismaMock.event.create).toHaveBeenCalledWith({
      data: {
        userId,
        start: `${startDate}T00:00:00.000Z`,
        end: `${endDate}T00:00:00.000Z`,
        timezone: 'not applicable', // events with no datetime have no timezone
        recurrence: `RRULE:FREQ=DAILY;UNTIL=${endDate.replaceAll('-', '')}T000000Z`,
        travel: {
          create: {
            userId,
            location,
            timezone: 'America/Los_Angeles',
          },
        },
      },
    })
  })

  it("should register and add the travel to the user's calendar", async () => {
    const mockedEventNotificationSender = jest.mocked(sendEventNotification)
    mockedEventNotificationSender.mockResolvedValue('someGoogleID')
    await registerTravel({
      userId,
      location,
      coords,
      startDate,
      endDate,
      calendarAction: true,
    })
    expect(mockedEventNotificationSender).toHaveBeenCalled()
    expect(prismaMock.event.create).toHaveBeenCalledWith({
      data: {
        userId,
        googleEventId: 'someGoogleID',
        start: `${startDate}T00:00:00.000Z`,
        end: `${endDate}T00:00:00.000Z`,
        timezone: 'not applicable', // events with no datetime have no timezone
        recurrence: `RRULE:FREQ=DAILY;UNTIL=${endDate.replaceAll('-', '')}T000000Z`,
        travel: {
          create: {
            userId,
            location,
            timezone: 'America/Los_Angeles',
          },
        },
      },
    })
  })
})
