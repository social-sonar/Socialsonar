import { prismaMock } from '../../../../../singleton'
import {
  getEventsSyncData,
  getSafeCalendarEvents,
  syncGoogleCalendar,
} from '@/lib/data/google/events'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

describe('Calendar features', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should categorize events for update when they already exist in the database', async () => {
    const syncResults = [
      { id: 'abc', description: 'event 1' },
      { id: 'def', description: 'event 2' },
    ]
    const mockExistingEvents = [
      {
        id: '1',
        googleEventId: 'abc',
        userId: 'userId',
        recurrence: 'some recurrence',
        start: new Date(),
        end: new Date(),
        timezone: 'some tz',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    prismaMock.event.findMany.mockResolvedValue(mockExistingEvents)

    const result = await getEventsSyncData(syncResults)

    expect(result.toUpdate).toEqual([syncResults[0]])
    expect(result.toCreate).toEqual([syncResults[1]])
  })

  it('should return the corresponding events without calling refreshToken', async () => {
    const mockDateWithoutParams = new Date('2024-07-25T12:00:00.000Z')
    const OriginalDate = global.Date
    global.Date = jest.fn().mockImplementation((...args) => {
      if (args.length === 0) {
        // If no arguments, return the mocked date
        return mockDateWithoutParams
      }
      // Otherwise, call the original Date constructor with provided arguments
      return new OriginalDate(args[0])
    }) as unknown as DateConstructor
    global.Date.UTC = OriginalDate.UTC

    const oauth2Client = new OAuth2Client()
    const calendar = {
      context: jest.fn(),
      acl: jest.fn(),
      calendarList: jest.fn(),
      calendars: jest.fn(),
      channels: jest.fn(),
      colors: jest.fn(),
      freebusy: jest.fn(),
      settings: jest.fn(),
      events: {
        list: jest.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: '1',
                start: {
                  dateTime: new Date('2024-07-30T12:00:00.000Z'), // valid
                },
                status: 'accepted',
              },
              {
                id: '2',
                start: {
                  dateTime: new Date('2024-07-30T12:00:00.000Z'), // invalid
                },
                status: 'cancelled',
              },
              {
                id: '3',
                start: {
                  dateTime: new Date('2024-08-30T12:00:00.000Z'), // valid
                },
                status: 'accepted',
              },
              {
                id: '4',
                start: {
                  dateTime: new Date('2024-07-24T12:00:00.000Z'), // invalid
                },
                status: 'accepted',
              },
              {
                id: '5',
                start: {
                  dateTime: new Date('2024-07-23T12:00:00.000Z'), // invalid
                },
                status: 'accepted',
                recurrence: ['RRULE:FREQ=DAILY;UNTIL=20240710T000000Z'],
              },
              {
                id: '6',
                start: {
                  dateTime: new Date('2024-07-23T12:00:00.000Z'), // valid
                },
                status: 'accepted',
                recurrence: ['RRULE:FREQ=DAILY;UNTIL=20241010T000000Z'],
              },
            ],
            nextSyncToken: 'testSyncToken',
          },
        }),
      },
    }
    jest.spyOn(google, 'calendar').mockReturnValue(calendar as any)

    const result = await getSafeCalendarEvents(oauth2Client, false, {
      id: '1',
      googleId: '1',
      email: 'john.doe@example.com',
      accessToken: 'ya29.1234567890',
      refreshToken: '1/234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
      token: null,
      calendarToken: 'token',
      ableToWrite: true,
    })

    expect(result.data).toHaveLength(3)
    expect(result.data[0].id).toBe('1')
    expect(result.data[1].id).toBe('3')
    expect(result.data[2].id).toBe('6')
  })

  it('should successfully call syncGoogleCalendar', async () => {
    const mockExistingEvents = [
      {
        id: '1',
        googleEventId: '1',
        userId: 'userId',
        recurrence: 'some recurrence',
        start: new Date(),
        end: new Date(),
        timezone: 'some tz',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    prismaMock.event.findMany.mockResolvedValue(mockExistingEvents)
    const mockDateWithoutParams = new Date('2024-07-25T12:00:00.000Z')
    const OriginalDate = global.Date
    global.Date = jest.fn().mockImplementation((...args) => {
      if (args.length === 0) {
        // If no arguments, return the mocked date
        return mockDateWithoutParams
      }
      // Otherwise, call the original Date constructor with provided arguments
      return new OriginalDate(args[0])
    }) as unknown as DateConstructor
    global.Date.UTC = OriginalDate.UTC
    const authData = {
      oauth2Client: new google.auth.OAuth2(),
      googleAccount: {
        id: '1',
        googleId: '1',
        email: 'john.doe@example.com',
        accessToken: 'ya29.1234567890',
        refreshToken: '1/234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
        token: null,
        calendarToken: 'token',
        ableToWrite: true,
      },
    }

    const calendarEvents = [
      {
        id: '1',
        start: {
          dateTime: new Date('2024-07-30T12:00:00.000Z'), // valid
        },
        end: {
          dateTime: new Date('2024-07-31T13:00:00.000Z').toISOString(),
        },
        status: 'accepted',
      },
      {
        id: '2',
        start: {
          dateTime: new Date('2024-08-30T12:00:00.000Z'), // valid
        },
        end: {
          dateTime: new Date('2024-07-31T13:00:00.000Z').toISOString(),
        },
        status: 'accepted',
      },
      {
        id: '3',
        start: {
          dateTime: new Date('2024-07-23T12:00:00.000Z'), // valid
        },
        end: {
          dateTime: new Date('2024-07-31T13:00:00.000Z').toISOString(),
        },
        status: 'accepted',
        recurrence: ['RRULE:FREQ=DAILY;UNTIL=20241010T000000Z'],
      },
    ]

    const calendar = {
      context: jest.fn(),
      acl: jest.fn(),
      calendarList: jest.fn(),
      calendars: jest.fn(),
      channels: jest.fn(),
      colors: jest.fn(),
      freebusy: jest.fn(),
      settings: jest.fn(),
      events: {
        list: jest.fn().mockResolvedValue({
          data: {
            items: calendarEvents,
            nextSyncToken: 'testSyncToken',
          },
        }),
      },
    }
    jest.spyOn(google, 'calendar').mockReturnValue(calendar as any)

    await syncGoogleCalendar(
      '1',
      {
        id: '1',
        googleId: '1',
        email: 'john.doe@example.com',
        accessToken: 'ya29.1234567890',
        refreshToken: '1/234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
        token: null,
        calendarToken: 'token',
        ableToWrite: true,
      },
      true,
    )

    expect(prismaMock.event.updateMany).toHaveBeenCalledWith({
      where: {
        googleEventId: calendarEvents[0].id,
      },
      data: {
        start: calendarEvents[0].start!.dateTime,
        end: calendarEvents[0].end!.dateTime,
        timezone: 'not applicable',
      },
    })
    expect(prismaMock.event.createMany).toHaveBeenCalledWith({
      data: [
        {
          userId: '1',
          googleEventId: calendarEvents[1].id,
          start: calendarEvents[1].start!.dateTime,
          end: calendarEvents[1].end!.dateTime,
          timezone: 'not applicable',
        },
        {
          userId: '1',
          googleEventId: calendarEvents[2].id,
          start: calendarEvents[2].start!.dateTime,
          end: calendarEvents[2].end!.dateTime,
          timezone: 'not applicable',
          recurrence: 'RRULE:FREQ=DAILY;UNTIL=20241010T000000Z',
        },
      ],
    })
    expect(prismaMock.googleAccount.update).toHaveBeenCalledWith({
      where: {
        id: '1',
      },
      data: {
        calendarToken: 'testSyncToken',
      },
    })
  })
})
