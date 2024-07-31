jest.mock('../../../../src/lib/utils/common')
import { getOAuthClient, getSession } from '@/lib/utils/common'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { prepareBackup } from '@/actions/google/events/backupRestore'

describe('Prepare backup action', () => {
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
  it('should get events and successfully encode them', async () => {
    const user = {
      id: '1',
      name: 'FooBar',
      email: 'foo@bar.com',
    }
    jest.mocked(getOAuthClient).mockResolvedValue({
      oauth2Client: new OAuth2Client(),
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
    })

    jest.mocked(getSession).mockResolvedValue({
      user,
      accessToken: 'abc',
      refreshToken: 'abc',
      expiresAt: 1,
      expires: '1',
    })

    const calendarEvents = [
      {
        id: '1',
        start: {
          dateTime: new Date('2024-07-30T12:00:00.000Z'),
        },
        end: {
          dateTime: new Date('2024-07-31T13:00:00.000Z').toISOString(),
        },
        status: 'accepted',
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
          },
        }),
      },
    }
    jest.spyOn(google, 'calendar').mockReturnValue(calendar as any)

    const expectedResponse = {
      email: user.email,
      data: Buffer.from(
        JSON.stringify({
          data: calendarEvents,
          id: user.id,
        }),
        'utf8',
      ).toString('base64'),
      date: new Date(),
      user: user.name,
    }

    const result = await prepareBackup()

    expect(jest.mocked(getSession)).toHaveBeenCalled()
    expect(jest.mocked(getOAuthClient)).toHaveBeenCalledWith('1')
    expect(result).toEqual(expectedResponse)
  })
})
