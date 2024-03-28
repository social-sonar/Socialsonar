import { type NextFunction, type Request, type Response } from 'express'
import User from '../models/User'
import { ErrorType, CustomError } from '../types/CustomError'

export async function getUsers (res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await User.findAll()

    res.status(200).send({
      message: 'Users retrieved successfully',
      data: users
    })
  } catch (error) {
    next(error)
  }
}

export async function createUser (req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.params as { name: string }

    if (typeof name !== 'string' || name.length < 2) {
      throw new CustomError({
        type: ErrorType.VALIDATION,
        message: 'Name must be a string with at least 2 characters'
      })
    }
    const createdUser = await User.create({
      name: req.params.name
    })
    res.status(200).json({
      message: 'User created successfully',
      data: createdUser
    })
  } catch (error) {
    next(error)
  }
}
