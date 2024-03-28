export enum ErrorType {
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION = 'VALIDATION'
}

export interface CustomErrorType extends Error {
  type: ErrorType
  message: string
  stack?: string
  code?: number
}

export class CustomError extends Error implements CustomErrorType {
  type: ErrorType = ErrorType.INTERNAL_SERVER_ERROR
  message!: string
  stack?: string
  code?: number
  constructor (params: Partial<CustomErrorType> = {}) {
    super()
    Object.assign(this, params)
  }
}
