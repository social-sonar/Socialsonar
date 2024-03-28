import { type Request, type Response, type NextFunction } from 'express'

export const responseTimeLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startHrTime = process.hrtime()

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime)
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${elapsedTimeInMs.toFixed(3)} ms`)
  })

  next()
}
