import type { Response } from "express";

export function success<T>(
  res: Response,
  message?: string,
  data?: T,
  status = 200,
) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function error(
  res: Response,
  message: string,
  error?: unknown,
  status = 500,
) {
  console.log(`Error: ${error}, Status: ${status}`);
  return res.status(status).json({
    success: false,
    message,
  });
}
