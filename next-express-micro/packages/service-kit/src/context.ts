import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export type RequestContextStore = {
  requestId: string;
  userId?: string;
};

const storage = new AsyncLocalStorage<RequestContextStore>();

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.header("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", requestId);
  storage.run({ requestId }, next);
}

export function getRequestContext(): RequestContextStore | undefined {
  return storage.getStore();
}
