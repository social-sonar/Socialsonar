jest.mock('../../../src/lib/utils/common')
import {
  changeHomeBaseStatus,
  removeHomeBase,
  upsertLocation,
} from '@/lib/data/safeQueries'
import { LocationSetData } from '@/lib/definitions'
import { prismaMock } from '../../../singleton'
import { getSession } from '@/lib/utils/common'

const mockedSession = jest.mocked(getSession)
mockedSession.mockResolvedValue({
  user: {
    id: '1',
    name: 'FooBar',
    email: 'foo@bar.com',
  },
  accessToken: 'abc',
  refreshToken: 'abc',
  expiresAt: 1,
  expires: '1',
})

beforeEach(() => {
  mockedSession.mockClear()
})

describe('Upsert home bases', () => {
  const data: LocationSetData = {
    data: {
      coords: '34,-118',
      location: 'Los Angeles',
    },
    homeBaseId: '123',
  }
  it('should update locations / home bases', async () => {
    await upsertLocation(data)
    expect(prismaMock.homeBase.update).toHaveBeenCalledWith({
      where: {
        id: '123',
      },
      data: {
        coords: data.data.coords,
        location: data.data.location,
        active: false,
        timezone: 'America/Los_Angeles',
      },
      select: {
        id: true,
        location: true,
        active: true,
        coords: true,
      },
    })
  })

  it('should create a new home base / location', async () => {
    const createData = { data: data.data }
    await upsertLocation(createData)
    expect(mockedSession).toHaveBeenCalled()
    expect(prismaMock.homeBase.create).toHaveBeenCalledWith({
      data: {
        coords: createData.data.coords,
        location: createData.data.location,
        userId: '1',
        timezone: 'America/Los_Angeles',
      },
      select: {
        id: true,
        location: true,
        active: true,
        coords: true,
      },
    })
  })
})

describe('Home base status', () => {
  it('should activate the home base status, hence call getSession', async () => {
    await changeHomeBaseStatus('123', true)
    expect(mockedSession).toHaveBeenCalled()
    expect(prismaMock.homeBase.updateMany).toHaveBeenCalledWith({
      where: {
        userId: '1',
      },
      data: {
        active: false,
      },
    })
    expect(prismaMock.homeBase.update).toHaveBeenCalledWith({
      where: {
        id: '123',
      },
      data: {
        active: true,
      },
    })
  })
  it('should deactivate the home base status', async () => {
    await changeHomeBaseStatus('123', false)
    expect(mockedSession).toHaveBeenCalledTimes(0)
    expect(prismaMock.homeBase.update).toHaveBeenCalledWith({
      where: {
        id: '123',
      },
      data: {
        active: false,
      },
    })
  })
})

it('should remove a home base', async () => {
  await removeHomeBase('123')
  expect(prismaMock.homeBase.delete).toHaveBeenCalledWith({
    where: {
      id: '123',
    },
  })
})
