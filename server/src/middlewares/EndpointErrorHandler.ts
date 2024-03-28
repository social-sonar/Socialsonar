import { type Request, type Response, type NextFunction } from 'express'

export const endpointErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack)

  res.status(500).send({
    message: 'An error occurred',
    error: 'check the app logs'
  })
}
