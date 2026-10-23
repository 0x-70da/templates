import { Response } from "express";

export function success(
  res: Response,
  message?: string,
  data?: unknown,
  status = 200,
) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function error(res: Response, message: string, status = 500) {
  console.log(`Error: ${message}, Status: ${status}`);
  return res.status(status).json({
    success: false,
    message,
  });
}
