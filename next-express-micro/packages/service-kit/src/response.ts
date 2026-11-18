import type { Response } from "express";

export function success<T = unknown>(res: Response, message?: string, data?: T, status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function error(res: Response, message: string, _err?: unknown, status = 500) {
  return res.status(status).json({ success: false, message });
}
