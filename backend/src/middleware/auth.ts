import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

const secret = process.env.JWT_SECRET || 'supersecretchangeme'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('authorization')
  if (!authHeader) return res.status(401).json({ error: 'Token ausente' })

  const token = authHeader.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, secret)
    req.user = payload
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}
