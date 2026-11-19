// src/context.ts
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

const storage = new AsyncLocalStorage<{ requestId: string }>();

export const getRequestId = (): string | undefined => storage.getStore()?.requestId;

export const requestContext: RequestHandler = (req, res, next) => {
  const incoming = req.header("x-request-id");
  const requestId = incoming && /^[\w-]{8,64}$/.test(incoming) ? incoming : randomUUID();
  req.headers["x-request-id"] = requestId; // بيتبعت تلقائيًا للـ proxy
  res.setHeader("x-request-id", requestId);
  storage.run({ requestId }, next);
};
