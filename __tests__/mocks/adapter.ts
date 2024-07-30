export function PrismaAdapter(_: any) {
  return {
    createUser: jest.fn(),
    getUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByAccount: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    linkAccount: jest.fn(),
    unlinkAccount: jest.fn(),
    getSessionAndUser: jest.fn(),
    createSession: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    createVerificationToken: jest.fn(),
    useVerificationToken: jest.fn(),
    getAccount: jest.fn(),
    createAuthenticator: jest.fn(),
    getAuthenticator: jest.fn(),
    listAuthenticatorsByUserId: jest.fn(),
    updateAuthenticatorCounter: jest.fn(),
  }
}