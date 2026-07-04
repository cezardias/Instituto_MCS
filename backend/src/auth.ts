import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const jwtSecret = process.env.JWT_SECRET || 'supersecretchangeme'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: object) {
  return jwt.sign(payload, jwtSecret, { expiresIn: '12h' })
}

export function verifyToken(token: string) {
  return jwt.verify(token, jwtSecret)
}
