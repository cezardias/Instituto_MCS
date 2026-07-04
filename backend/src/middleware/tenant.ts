import { NextFunction, Request, Response } from 'express'

declare global {
  namespace Express {
    interface Request {
      tenantId?: string
    }
  }
}

export default function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  const tenantId = req.header('x-tenant-id') || String(req.query.tenant || 'default')
  req.tenantId = tenantId
  next()
}
